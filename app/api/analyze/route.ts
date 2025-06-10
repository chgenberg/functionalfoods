import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

// Använd miljövariabeln för API-nyckeln
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { bodyPart, description, answers, numQuestions } = await req.json();

    const prompt = `
    A user has selected the body part: "${bodyPart}" and described their problem as: "${description}".
    Here are their answers to follow-up questions:
    ${answers}
    
    You are a highly skilled digital health expert and coach. 
    Your task is to provide a comprehensive, holistic, and actionable health analysis and plan for the user, based on all information above.
    
    For each section in the JSON below, write a thorough, detailed, and helpful answer. 
    - **riskProfile**: Give a nuanced risk assessment for each category, explaining why the risk is low/medium/high and what it means for the user.
    - **redFlags**: List at least 3-5 warning signs or symptoms that require urgent medical attention, and explain why.
    - **scenarios**: Describe at least 2-3 possible causes or outcomes for the user's symptoms, with reasoning.
    - **timeline**: Create a step-by-step plan for the coming weeks, including what to do now, in a week, in a month, and what to monitor. Be specific and actionable.
    - **checklist**: Provide a list of concrete actions, habits, and warning signs to track, with explanations.
    - **mealPlan**: Suggest a full day's meal plan tailored to the user's problem, with explanations for each meal and why it helps.
    - **micronutrients**: 
    - If the user's answers do not indicate any possible micronutrient deficiencies, reply: "Based on your current description, it is difficult to assess potential micronutrient deficiencies. [Click here to do a basic analysis.]"
    - If there are possible micronutrient issues, provide a table with at least Vitamin C, Vitamin D, Calcium, Magnesium, and Omega-3 fatty acids. For each, only assess the status (e.g. "normal", "low", "deficient") and a short description, but do NOT include any recommendations such as 'Consider increasing intake'. Always end the section with: "[Click here to do a basic analysis.]"    - **symptomTracker**: Suggest how the user should track their symptoms over time, including what to note and how often.
    - **aiChatIntro**: Write a friendly, motivating introduction to the AI chat, explaining how it can help the user further.
    - **references**: List at least 5 reputable scientific or medical sources for further reading.
    - **costBenefit**: Compare the value and cost of recommended tests, supplements, or actions, and explain the reasoning.
    - **localExperts**: Suggest what type of specialist or clinic the user should look for, and what to ask them.
    - **pdfLink**: Leave this field empty.
    - **holisticAdvices**: Provide a comprehensive set of holistic health and lifestyle advices tailored to the user's main problem. This section should always include:
      - A detailed lifestyle and habit advice section
      - A full meal plan for the next week, with explanations for each meal
      - A step-by-step checklist for daily actions
    Present all content in a clear, structured way.
    
    Each field should be at least 3-5 sentences or bullet points, and as comprehensive as possible, as if writing a personalized health report. Use clear formatting and bullet points where appropriate. Always answer in English.
    
    When writing the report, use relevant emojis to make the text more engaging and friendly. For example, use 🥗 for meal plans, 📝 for checklists, 🧬 for micronutrients, ❤️ for cardiovascular, 🧘 for holistic advices, and so on. Place emojis at the start of sections or sentences where appropriate, but do not overuse them.
    
    Use bullet points, bold important words, and add a short motivational tip or quote in the Holistic Health Advices section. Make the language friendly and supportive.
    
    Return the result as a JSON object with these fields:
    {
      "riskProfile": { "inflammation": "...", "nutrient": "...", "allergy": "...", "dysbiosis": "..." },
      "redFlags": [ ... ],
      "scenarios": [ ... ],
      "timeline": "...",
      "checklist": [ ... ],
      "mealPlan": "...",
      "micronutrients": { ... },
      "symptomTracker": "...",
      "aiChatIntro": "...",
      "references": [ ... ],
      "costBenefit": "...",
      "localExperts": [ ... ],
      "pdfLink": "",
      "holisticAdvices": {
        "advices": "...",
        "checklist": [ ... ]
      }
    }
    Only return valid JSON, no explanation, no markdown, no text before or after.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content || "";
    console.log("GPT content:", content);

    // Extrahera JSON-objektet ur svaret
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "No JSON found in GPT response", raw: content }, { status: 500 });
    }

    const jsonString = jsonMatch[0];
    let resultObj;
    try {
      resultObj = JSON.parse(jsonString);
    } catch (err) {
      return NextResponse.json({ error: "Invalid JSON from GPT", raw: jsonString }, { status: 500 });
    }

    // Om GPT vill ha fler frågor
    if (content.includes("NEED_MORE_INFO")) {
      // Extrahera nya frågor (om du vill, annars hantera separat)
      return NextResponse.json({ needMoreQuestions: true, newQuestions: resultObj });
    } else {
      return NextResponse.json({ needMoreQuestions: false, result: resultObj });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}