import sys
import docx
import os

def extract_text_from_docx(docx_path, output_path):
    """Extracts all text from a Word document and saves it to a file."""
    try:
        doc = docx.Document(docx_path)
        with open(output_path, 'w', encoding='utf-8') as f:
            for para in doc.paragraphs:
                f.write(para.text + '\\n')
        print(f"Text extracted successfully to {output_path}")
    except Exception as e:
        print(f"Error extracting text: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python extract_docx.py <input_docx_path> <output_txt_path>", file=sys.stderr)
        sys.exit(1)
    
    docx_file = sys.argv[1]
    output_file = sys.argv[2]
    
    extract_text_from_docx(docx_file, output_file) 