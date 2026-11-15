// Spike (step 1): proves a plain <form method="post"> works against a page
// action with no client JS. Delete once the real forms exist.
import '../src/styles.css';
import type { Props } from './spike.server';

export default function SpikePage({ messages }: Props) {
  return (
    <main className="page narrow">
      <h1>Spike</h1>
      <form method="post" action="/spike">
        <div className="field">
          <label htmlFor="text">Text</label>
          <input type="text" id="text" name="text" required maxLength={100} />
        </div>
        <div className="buttons">
          <button className="btn wide">Spara</button>
        </div>
      </form>
      <ul>
        {messages.map((message) => (
          <li key={message.id}>{message.text}</li>
        ))}
      </ul>
    </main>
  );
}
