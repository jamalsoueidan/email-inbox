import { ConvexError, v } from "convex/values";

import { internalAction } from "./_generated/server";

export const shortenMessage = internalAction({
  args: {
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const { content } = args;

    const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAPI}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that specializes in summarizing emails by removing greetings, signatures, and any polite but non-essential phrases. Focus on capturing only the critical information, such as meeting details, feedback, or action items, and rewrite from the sender’s perspective in a concise manner.",
          },
          { role: "user", content },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "response",
            schema: {
              type: "object",
              properties: {
                shortMessage: { type: "string" },
              },
              required: ["shortMessage"],
            },
          },
        },
      }),
    });

    const json: ChatGPTResponse = await response.json();

    if (json.error) {
      throw new ConvexError(json.error);
    }

    const pdf = JSON.parse(json.choices[0].message.content);

    console.log(pdf);

    return pdf;
    /*await ctx.runMutation(internal.resumes.updateInternal, {
      workExperiences: [],
      educations: [],
      socialProfiles: [],
      socialProfilesVisible: false,
      languages: [],
      languagesVisible: false,
      skills: [],
      skillsVisible: false,
      references: [],
      referencesVisible: false,
      courses: [],
      coursesVisible: false,
      internships: [],
      internshipsVisible: false,
      ...pdf,
      _id: args.id,
      userId: user || undefined,
      title: "Imported from PDF",
      template: {
        name: "Aarhus",
        color: "#ffe14c",
        lineHeight: "1.5",
        fontSize: "12",
        fontFamily: "Arial",
      },
    });*/
  },
});

interface ChatGPTResponse {
  error?: string;
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Choice[];
  usage: Usage;
  system_fingerprint: string;
}
interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  completion_tokens_details: Completiontokensdetails;
}

interface Completiontokensdetails {
  reasoning_tokens: number;
}

interface Choice {
  index: number;
  message: Message;
  finish_reason: string;
}

interface Message {
  role: string;
  content: string;
}
