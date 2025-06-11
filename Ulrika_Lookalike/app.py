from flask import Flask, render_template, request, jsonify, send_file
import os
from text_analyzer import generate_book
import time
from fpdf import FPDF
import threading

app = Flask(__name__)

# Global variabel för att hålla koll på genereringsstatus
generation_status = {
    'is_generating': False,
    'progress': 0,
    'current_chapter': 0,
    'total_chapters': 0,
    'book_path': None
}

def generate_book_thread(book_title, topic, num_chapters):
    global generation_status
    generation_status['is_generating'] = True
    generation_status['total_chapters'] = num_chapters
    generation_status['current_chapter'] = 0
    
    try:
        # Skapa en unik mapp för denna bok
        book_dir = os.path.join("books", book_title.replace(" ", "_"))
        if not os.path.exists(book_dir):
            os.makedirs(book_dir)
        
        # Generera boken
        generate_book(book_title, topic, num_chapters)
        
        # Skapa PDF med Unicode-stöd (fpdf2 och DejaVuSans)
        pdf = FPDF()
        pdf.add_page()
        font_path = os.path.join("fonts", "DejaVuSans.ttf")
        pdf.add_font("DejaVu", style="", fname=font_path, uni=True)
        pdf.add_font("DejaVu", style="B", fname=font_path, uni=True)
        pdf.set_font("DejaVu", "B", 16)
        pdf.cell(200, 10, txt=book_title, ln=1, align='C')
        pdf.ln(10)
        pdf.set_font("DejaVu", size=12)
        for i in range(1, num_chapters + 1):
            chapter_file = os.path.join(book_dir, f"chapter_{i:02d}.txt")
            if os.path.exists(chapter_file):
                with open(chapter_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    pdf.multi_cell(0, 10, txt=f"Kapitel {i}\n\n{content}")
                    pdf.ln(10)
        pdf_path = os.path.join(book_dir, f"{book_title.replace(' ', '_')}.pdf")
        pdf.output(pdf_path)
        
        generation_status['book_path'] = book_dir
        generation_status['is_generating'] = False
        generation_status['progress'] = 100
        
    except Exception as e:
        print(f"Ett fel uppstod: {str(e)}")
        generation_status['is_generating'] = False
        generation_status['progress'] = 0

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    data = request.json
    book_title = data.get('title')
    topic = data.get('topic')
    num_chapters = int(data.get('chapters'))
    
    # Starta generering i en separat tråd
    thread = threading.Thread(
        target=generate_book_thread,
        args=(book_title, topic, num_chapters)
    )
    thread.start()
    
    return jsonify({'status': 'started'})

@app.route('/status')
def status():
    return jsonify(generation_status)

@app.route('/download/<path:filename>')
def download_file(filename):
    return send_file(
        os.path.join('books', filename),
        as_attachment=True
    )

if __name__ == '__main__':
    app.run(debug=True) 