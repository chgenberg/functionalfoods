# Text Generator

Detta program använder ChatGPT för att generera texter i samma stil som exempeltexter från en specifik person.

## Installation

1. Installera Python 3.8 eller senare om du inte redan har det.
2. Installera de nödvändiga paketen:
   ```bash
   pip install -r requirements.txt
   ```
3. Skapa en `.env`-fil i projektets rotmapp och lägg till din OpenAI API-nyckel:
   ```
   OPENAI_API_KEY=din_api_nyckel_här
   ```

## Användning

1. Placera exempeltexter i `sample_texts`-mappen. Varje text ska vara i en separat .txt-fil.
2. Kör programmet:
   ```bash
   python text_analyzer.py
   ```
3. Ange en prompt när programmet frågar efter det.
4. Programmet kommer att generera en text i samma stil som exempeltexterna.

## Tips

- Ju fler exempeltexter du lägger till, desto bättre kommer programmet att förstå personens skrivstil.
- Var noga med att använda samma språk i prompten som i exempeltexterna.
- Om du vill få olika varianter av texter, kör programmet flera gånger med samma prompt. 