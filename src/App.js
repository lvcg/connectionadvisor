import React, { useMemo, useState } from "react";
import "./App.css";
import { buildLocalCoachResponse, requestElizaAdvice } from "./elizaClient";

const starterConnections = [
  {
    id: "sample-1",
    name: "Maya",
    stage: "Planning first date",
    location: "Downtown",
    interests: "art galleries, ramen, live jazz",
    vibe: "Warm, curious, a little playful",
    goals: "Intentional dating, slow build",
    notes: "Great text chemistry. Likes low-pressure plans and thoughtful conversation.",
    budget: "Moderate",
    mood: "Creative",
  },
  {
    id: "sample-2",
    name: "Jordan",
    stage: "Messaging",
    location: "Westside",
    interests: "coffee, hiking, indie movies",
    vibe: "Grounded and outdoorsy",
    goals: "Long-term relationship",
    notes: "Replies consistently, asks good questions, prefers daytime plans.",
    budget: "Low-key",
    mood: "Casual",
  },
];

const datingTips = [
  "Suggest a plan with a clear time, place, and easy exit point.",
  "Match effort, not anxiety. Consistency matters more than speed.",
  "Use curiosity over performance: ask about stories, not resumes.",
  "Notice how you feel after the interaction, not only how much you like them.",
  "Keep first dates simple: 60 to 90 minutes is enough signal.",
  "Avoid turning texting into the whole relationship. Move to a plan when there is mutual interest.",
];

const emptyForm = {
  name: "",
  stage: "Messaging",
  location: "",
  interests: "",
  vibe: "",
  goals: "",
  notes: "",
  budget: "Moderate",
  mood: "Casual",
};

const getStoredConnections = () => {
  try {
    const stored = localStorage.getItem("connectionadvisor.connections");
    return stored ? JSON.parse(stored) : starterConnections;
  } catch {
    return starterConnections;
  }
};

const saveConnections = (connections) => {
  localStorage.setItem("connectionadvisor.connections", JSON.stringify(connections));
};

const getCompatibilityScore = (connection) => {
  const fields = [connection.interests, connection.vibe, connection.goals, connection.notes];
  const depth = fields.filter((field) => field.trim().length > 12).length;
  const intentional = /long|serious|intentional|relationship|values|slow|build/i.test(
    `${connection.goals} ${connection.notes}`
  );
  const consistent = /consistent|asks|curious|warm|kind|clear|thoughtful/i.test(
    `${connection.vibe} ${connection.notes}`
  );
  return Math.min(96, 58 + depth * 8 + (intentional ? 8 : 0) + (consistent ? 6 : 0));
};

const getDateIdea = (connection) => {
  const text = `${connection.interests} ${connection.mood}`.toLowerCase();
  const location = connection.location || "a convenient neighborhood";
  const budget = connection.budget.toLowerCase();

  if (text.includes("art") || text.includes("creative")) {
    return `Browse a small gallery or maker market near ${location}, then grab dessert or tea nearby.`;
  }
  if (text.includes("music") || text.includes("jazz") || text.includes("live")) {
    return `Find a low-volume live music set near ${location} and pair it with a relaxed drink after.`;
  }
  if (text.includes("hiking") || text.includes("outdoor") || text.includes("walk")) {
    return `Take a scenic walk near ${location}, then stop for coffee so the date has an easy second act.`;
  }
  if (text.includes("food") || text.includes("ramen") || text.includes("dinner")) {
    return `Pick a casual ${budget === "low-key" ? "counter-service" : "cozy"} food spot near ${location} with a backup cafe close by.`;
  }
  return `Choose a simple coffee, dessert, or bookstore plan near ${location} that lasts about 75 minutes.`;
};

const getMessage = (connection) => {
  const interest = connection.interests.split(",")[0]?.trim() || "that thing you mentioned";
  const location = connection.location || "somewhere easy for both of us";

  if (connection.stage === "Messaging") {
    return `I liked hearing about ${interest}. Want to do something low-key this week, maybe coffee around ${location}?`;
  }
  if (connection.stage === "Planning first date") {
    return `I found a couple of places near ${location} that fit your vibe. Want me to send you two options and we can pick the easier one?`;
  }
  if (connection.stage === "After first date") {
    return `I had a good time and would like to see you again. Want to plan something simple next week?`;
  }
  return `I have enjoyed getting to know you and want to keep this thoughtful. What would feel like a good next step?`;
};

const getConversationTopics = (connection) => {
  const interests = connection.interests
    .split(",")
    .map((interest) => interest.trim())
    .filter(Boolean)
    .slice(0, 3);

  const base = interests.length > 0 ? interests : ["favorite weekends", "recent surprises", "places they love"];

  return [
    `Ask what got them into ${base[0]}.`,
    `Ask what a great ${connection.mood.toLowerCase()} date feels like to them.`,
    `Ask what they are looking forward to this month.`,
  ];
};

const getRecommendation = (connection) => {
  const score = getCompatibilityScore(connection);

  if (score >= 82) {
    return "Strong signal. Move from texting to a clear, low-pressure plan.";
  }
  if (score >= 70) {
    return "Promising, but gather one more signal before over-investing.";
  }
  return "Keep it light. Look for consistency, curiosity, and aligned intentions.";
};

function App() {
  const [connections, setConnections] = useState(getStoredConnections);
  const [form, setForm] = useState(emptyForm);
  const [selectedId, setSelectedId] = useState(connections[0]?.id || null);
  const [activeTab, setActiveTab] = useState("advisor");
  const [coachResult, setCoachResult] = useState(null);
  const [coachError, setCoachError] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);

  const selectedConnection = useMemo(
    () => connections.find((connection) => connection.id === selectedId) || connections[0],
    [connections, selectedId]
  );

  const advice = useMemo(() => {
    if (!selectedConnection) return null;

    return {
      score: getCompatibilityScore(selectedConnection),
      recommendation: getRecommendation(selectedConnection),
      dateIdea: getDateIdea(selectedConnection),
      message: getMessage(selectedConnection),
      topics: getConversationTopics(selectedConnection),
    };
  }, [selectedConnection]);

  const updateConnections = (nextConnections) => {
    setConnections(nextConnections);
    saveConnections(nextConnections);
  };

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const addConnection = (event) => {
    event.preventDefault();
    const nextConnection = {
      ...form,
      id: crypto.randomUUID(),
      name: form.name.trim(),
    };

    if (!nextConnection.name) return;

    const nextConnections = [nextConnection, ...connections];
    updateConnections(nextConnections);
    setSelectedId(nextConnection.id);
    setForm(emptyForm);
  };

  const deleteConnection = (id) => {
    const nextConnections = connections.filter((connection) => connection.id !== id);
    updateConnections(nextConnections);
    setSelectedId(nextConnections[0]?.id || null);
    setCoachResult(null);
    setCoachError("");
  };

  const askCoach = async () => {
    if (!selectedConnection || !advice) return;

    setCoachLoading(true);
    setCoachError("");

    try {
      const result = await requestElizaAdvice(selectedConnection, advice);
      setCoachResult(result);
    } catch (error) {
      setCoachError(error.message);
      setCoachResult({
        source: "local",
        status: "ElizaOS was unavailable, so the local coach generated this.",
        ...buildLocalCoachResponse(selectedConnection, advice),
      });
    } finally {
      setCoachLoading(false);
    }
  };

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">CA</span>
          <div>
            <h1>ConnectionAdvisor</h1>
            <p>Dating recommendations, tips, and date-night plans.</p>
          </div>
        </div>

        <form className="connection-form" onSubmit={addConnection}>
          <div className="form-heading">
            <span>New Connection</span>
            <button type="submit">Save</button>
          </div>

          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} placeholder="Alex" />
          </label>

          <div className="two-column">
            <label>
              Stage
              <select name="stage" value={form.stage} onChange={handleChange}>
                <option>Messaging</option>
                <option>Planning first date</option>
                <option>After first date</option>
                <option>Dating</option>
              </select>
            </label>
            <label>
              Budget
              <select name="budget" value={form.budget} onChange={handleChange}>
                <option>Low-key</option>
                <option>Moderate</option>
                <option>Special</option>
              </select>
            </label>
          </div>

          <label>
            Location
            <input name="location" value={form.location} onChange={handleChange} placeholder="Downtown, Westside..." />
          </label>

          <label>
            Interests
            <input name="interests" value={form.interests} onChange={handleChange} placeholder="coffee, jazz, museums" />
          </label>

          <label>
            Vibe
            <input name="vibe" value={form.vibe} onChange={handleChange} placeholder="Playful, thoughtful, outdoorsy" />
          </label>

          <label>
            Dating goals
            <input name="goals" value={form.goals} onChange={handleChange} placeholder="Long-term, casual, intentional" />
          </label>

          <label>
            Mood
            <select name="mood" value={form.mood} onChange={handleChange}>
              <option>Casual</option>
              <option>Creative</option>
              <option>Romantic</option>
              <option>Outdoorsy</option>
            </select>
          </label>

          <label>
            Notes
            <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="What have you noticed so far?" />
          </label>
        </form>

        <section className="connection-list" aria-label="Saved connections">
          {connections.map((connection) => (
            <button
              className={`connection-card ${connection.id === selectedConnection?.id ? "active" : ""}`}
              key={connection.id}
              onClick={() => setSelectedId(connection.id)}
              type="button"
            >
              <strong>{connection.name}</strong>
              <span>{connection.stage}</span>
            </button>
          ))}
        </section>
      </aside>

      <section className="workspace">
        <header className="hero">
          <div>
            <p className="eyebrow">Private Dating Concierge</p>
            <h2>Plan better messages and better dates.</h2>
            <p>
              Get a grounded read on a connection, a message you can send, date-night ideas, and practical tips without turning dating into homework.
            </p>
          </div>
          <div className="hero-stat">
            <span>{advice?.score || "--"}</span>
            <small>connection score</small>
          </div>
        </header>

        <nav className="tabs" aria-label="Advisor views">
          {["advisor", "ai coach", "date ideas", "tips"].map((tab) => (
            <button
              className={activeTab === tab ? "active" : ""}
              key={tab}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tab}
            </button>
          ))}
        </nav>

        {!selectedConnection && (
          <section className="empty-state">
            <h3>Add a connection to get advice.</h3>
            <p>Start with a name, interests, location, and what stage you are in.</p>
          </section>
        )}

        {selectedConnection && activeTab === "advisor" && (
          <section className="advisor-grid">
            <article className="primary-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Recommendation</p>
                  <h3>{selectedConnection.name}</h3>
                </div>
                <button className="delete-button" onClick={() => deleteConnection(selectedConnection.id)} type="button">
                  Delete
                </button>
              </div>
              <p className="recommendation">{advice.recommendation}</p>
              <dl className="connection-details">
                <div>
                  <dt>Stage</dt>
                  <dd>{selectedConnection.stage}</dd>
                </div>
                <div>
                  <dt>Goals</dt>
                  <dd>{selectedConnection.goals || "Not captured yet"}</dd>
                </div>
                <div>
                  <dt>Vibe</dt>
                  <dd>{selectedConnection.vibe || "Not captured yet"}</dd>
                </div>
              </dl>
            </article>

            <article className="advice-card">
              <p className="eyebrow">Suggested Message</p>
              <h3>Send this</h3>
              <p>{advice.message}</p>
            </article>

            <article className="advice-card">
              <p className="eyebrow">Conversation</p>
              <h3>Topics</h3>
              <ul>
                {advice.topics.map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
            </article>

            <article className="advice-card safety">
              <p className="eyebrow">Safety and Boundaries</p>
              <h3>Keep it grounded</h3>
              <p>Meet in public, tell a friend the plan, keep your own transportation, and trust discomfort as useful information.</p>
            </article>
          </section>
        )}

        {selectedConnection && activeTab === "ai coach" && (
          <section className="coach-layout">
            <article className="primary-panel coach-panel">
              <div>
                <p className="eyebrow">ElizaOS Agent</p>
                <h3>ConnectionCoach</h3>
                <p>
                  Ask the agent for a sharper recommendation, message, date plan, and safety note using the connection details you saved.
                </p>
              </div>
              <button className="coach-button" onClick={askCoach} disabled={coachLoading} type="button">
                {coachLoading ? "Asking Coach..." : "Ask Coach"}
              </button>
              <p className="coach-status">
                {process.env.REACT_APP_ELIZAOS_URL
                  ? `Connected to ${process.env.REACT_APP_ELIZAOS_URL}`
                  : "Local fallback is active until REACT_APP_ELIZAOS_URL is set."}
              </p>
              {coachError && <p className="coach-error">{coachError}</p>}
            </article>

            <article className="advice-card">
              <p className="eyebrow">Coach Read</p>
              <h3>{coachResult?.source === "elizaos" ? "ElizaOS response" : "Local response"}</h3>
              <p>{coachResult?.recommendation || "Ask the coach to generate a recommendation for this connection."}</p>
              {coachResult?.status && <small>{coachResult.status}</small>}
            </article>

            <article className="advice-card">
              <p className="eyebrow">Message</p>
              <h3>Sendable draft</h3>
              <p>{coachResult?.message || advice.message}</p>
            </article>

            <article className="advice-card">
              <p className="eyebrow">Plan</p>
              <h3>Date idea</h3>
              <p>{coachResult?.dateIdea || advice.dateIdea}</p>
            </article>

            <article className="advice-card safety">
              <p className="eyebrow">Safety</p>
              <h3>Boundary check</h3>
              <p>{coachResult?.safety || buildLocalCoachResponse(selectedConnection, advice).safety}</p>
            </article>

            <article className="advice-card">
              <p className="eyebrow">Conversation</p>
              <h3>Coach topics</h3>
              <ul>
                {(coachResult?.topics || advice.topics).map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
            </article>
          </section>
        )}

        {selectedConnection && activeTab === "date ideas" && (
          <section className="date-board">
            <article className="primary-panel">
              <p className="eyebrow">Best Fit Date</p>
              <h3>{advice.dateIdea}</h3>
              <p>
                Good first plans are specific, easy to say yes to, and simple to end gracefully if the chemistry is not there.
              </p>
            </article>

            {[
              ["Low-key", "Coffee walk plus a bookstore browse"],
              ["Creative", "Gallery night, maker market, or pottery cafe"],
              ["Food", "Ramen, tacos, dessert flight, or farmers market snacks"],
              ["Outdoorsy", "Botanical garden, scenic trail, or sunset picnic"],
              ["Romantic", "Jazz lounge, wine bar, or rooftop mocktails"],
              ["Rainy day", "Museum, board-game cafe, or cozy tea spot"],
            ].map(([title, idea]) => (
              <article className="date-card" key={title}>
                <span>{title}</span>
                <p>{idea}</p>
              </article>
            ))}
          </section>
        )}

        {activeTab === "tips" && (
          <section className="tips-grid">
            {datingTips.map((tip, index) => (
              <article className="tip-card" key={tip}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{tip}</p>
              </article>
            ))}
          </section>
        )}
      </section>
    </main>
  );
}

export default App;
