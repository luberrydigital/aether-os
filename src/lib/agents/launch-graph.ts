import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

export type LaunchAgent = {
  id: string;
  name: string;
  status: string;
  lane: "strategy" | "engineering" | "growth";
};

const LaunchState = Annotation.Root({
  sentence: Annotation<string>(),
  agents: Annotation<LaunchAgent[]>({
    reducer: (left, right) => [...left, ...right],
    default: () => [],
  }),
  narrative: Annotation<string>(),
});

async function strategist(state: typeof LaunchState.State) {
  return {
    agents: [
      {
        id: "strategist-1",
        name: "Market Strategist",
        status: "Compressing your idea into a wedge and ICP hypothesis",
        lane: "strategy",
      },
    ],
    narrative: `Positioning memo drafted for: ${state.sentence}`,
  };
}

async function engineer(state: typeof LaunchState.State) {
  const prior = state.narrative ?? "";
  return {
    agents: [
      {
        id: "engineer-1",
        name: "AI Systems Engineer",
        status: "Sketching agent graph, tools, and eval harness",
        lane: "engineering",
      },
    ],
    narrative: `${prior}\nEngineering blueprint queued for autonomous build.`,
  };
}

async function growth(state: typeof LaunchState.State) {
  const prior = state.narrative ?? "";
  return {
    agents: [
      {
        id: "growth-1",
        name: "Growth Operator",
        status: "Spinning acquisition loops + pricing experiments",
        lane: "growth",
      },
    ],
    narrative: `${prior}\nGo-to-market cadence armed for first revenue pings.`,
  };
}

const builder = new StateGraph(LaunchState)
  .addNode("strategist", strategist)
  .addNode("engineer", engineer)
  .addNode("growth", growth)
  .addEdge(START, "strategist")
  .addEdge("strategist", "engineer")
  .addEdge("engineer", "growth")
  .addEdge("growth", END);

const compiled = builder.compile();

export async function runLaunchGraph(sentence: string) {
  const result = await compiled.invoke({
    sentence: sentence.trim(),
  });

  return {
    agents: result.agents,
    narrative: result.narrative,
  };
}
