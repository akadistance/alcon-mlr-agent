"""
OCR Utilities for EyeQ
Hybrid OCR system using Tesseract (primary) and Claude Vision API (fallback)
Developer: Jason Jiwan
"""

import os
import base64
from io import BytesIO
from PIL import Image, ImageEnhance, ImageFilter
import pytesseract
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

# Initialize Anthropic client for vision API
anthropic_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def preprocess_image(image_path):
    """
    Preprocess image to improve OCR accuracy
    - Convert to grayscale
    - Enhance contrast
    - Denoise
    - Resize if needed
    """
    try:
        img = Image.open(image_path)
        
        # Convert to RGB if necessary (handle RGBA, P modes)
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Convert to grayscale
        img = img.convert('L')
        
        # Enhance contrast
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(2.0)
        
        # Enhance sharpness
        enhancer = ImageEnhance.Sharpness(img)
        img = enhancer.enhance(1.5)
        
        # Denoise
        img = img.filter(ImageFilter.MedianFilter(size=3))
        
        # Resize if image is too small (improves OCR)
        width, height = img.size
        if width < 1000:
            scale = 1000 / width
            new_size = (int(width * scale), int(height * scale))
            img = img.resize(new_size, Image.Resampling.LANCZOS)
        
        return img
    except Exception as e:
        print(f"Error preprocessing image: {e}")
        return Image.open(image_path)


def extract_text_tesseract(image_path, preprocess=True):
    """
    Extract text from image using Tesseract OCR
    
    Args:
        image_path: Path to image file
        preprocess: Whether to preprocess image (recommended)
    
    Returns:
        Extracted text as string
    """
    try:
        # Preprocess image for better accuracy
        if preprocess:
            img = preprocess_image(image_path)
        else:
            img = Image.open(image_path)
        
        # Configure Tesseract for better accuracy
        custom_config = r'--oem 3 --psm 6'  # OEM 3 = Default, PSM 6 = Assume uniform block of text
        
        # Extract text
        text = pytesseract.image_to_string(img, config=custom_config)
        
        # Clean up extracted text
        text = text.strip()
        
        if not text:
            print("⚠️ Tesseract extracted no text from image")
            return None
            
        print(f"✅ Tesseract extracted {len(text)} characters")
        return text
        
    except pytesseract.TesseractNotFoundError:
        print("❌ Tesseract not installed. Please install Tesseract OCR.")
        print("   Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki")
        print("   Mac: brew install tesseract")
        print("   Linux: sudo apt-get install tesseract-ocr")
        return None
    except Exception as e:
        print(f"❌ Tesseract OCR error: {e}")
        return None


def extract_text_claude_vision(image_path):
    """
    Extract text from image using Claude Vision API
    More accurate for complex layouts, handwriting, or low-quality images
    
    Args:
        image_path: Path to image file
    
    Returns:
        Extracted text as string
    """
    try:
        # Read and encode image
        with open(image_path, 'rb') as img_file:
            image_data = img_file.read()
        
        # Determine media type
        file_extension = os.path.splitext(image_path)[1].lower()
        media_type_map = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        }
        media_type = media_type_map.get(file_extension, 'image/jpeg')
        
        # Encode to base64
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        # Call Claude Vision API
        message = anthropic_client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": image_base64,
                            },
                        },
                        {
                            "type": "text",
                            "text": """Extract ALL text from this image exactly as it appears. 
                            
Instructions:
- Preserve the original formatting, line breaks, and structure
- Include all visible text, even if partially obscured
- If there are multiple text sections, separate them clearly
- If the image contains promotional or marketing content, extract everything
- Do not add any commentary or explanations
- Return ONLY the extracted text

Extracted text:"""
                        }
                    ],
                }
            ],
        )
        
        # Extract text from response
        text = message.content[0].text.strip()
        
        if not text:
            print("⚠️ Claude Vision extracted no text from image")
            return None
        
        print(f"✅ Claude Vision extracted {len(text)} characters")
        return text
        
    except Exception as e:
        print(f"❌ Claude Vision API error: {e}")
        return None


def extract_text_from_image(image_path, method='auto', use_claude_fallback=True):
    """
    Smart OCR extraction with automatic fallback
    
    Args:
        image_path: Path to image file
        method: 'tesseract', 'claude', or 'auto' (tries Tesseract first, falls back to Claude)
        use_claude_fallback: Whether to use Claude as fallback if Tesseract fails
    
    Returns:
        dict with keys:
            - text: Extracted text
            - method: Method used ('tesseract' or 'claude')
            - confidence: Quality indicator
    """
    result = {
        'text': '',
        'method': None,
        'confidence': 'unknown'
    }
    
    # Method 1: Tesseract (free, fast)
    if method in ['auto', 'tesseract']:
        print("🔍 Attempting OCR with Tesseract...")
        text = extract_text_tesseract(image_path)
        
        if text and len(text) > 20:  # Minimum threshold for meaningful text
            result['text'] = text
            result['method'] = 'tesseract'
            result['confidence'] = 'good' if len(text) > 100 else 'fair'
            print(f"✅ Tesseract successful ({len(text)} characters)")
            return result
        else:
            print("⚠️ Tesseract failed or extracted insufficient text")
    
    # Method 2: Claude Vision (paid, high accuracy)
    if method in ['auto', 'claude'] and (use_claude_fallback or method == 'claude'):
        print("🔍 Attempting OCR with Claude Vision API...")
        text = extract_text_claude_vision(image_path)
        
        if text:
            result['text'] = text
            result['method'] = 'claude_vision'
            result['confidence'] = 'high'
            print(f"✅ Claude Vision successful ({len(text)} characters)")
            return result
    
    # No text extracted
    if not result['text']:
        result['text'] = "[No text could be extracted from this image]"
        result['confidence'] = 'failed'
    
    return result


def is_image_file(filename):
    """Check if file is an image based on extension"""
    image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif'}
    return os.path.splitext(filename)[1].lower() in image_extensions


# Configuration
def get_ocr_config():
    """Get OCR configuration settings"""
    return {
        'tesseract_enabled': True,
        'claude_vision_enabled': True,
        'auto_fallback': True,
        'min_text_length': 20,
        'preprocess_images': True
    }

