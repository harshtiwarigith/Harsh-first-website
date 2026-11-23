import ScreenLock from '../components/ScreenLock.jsx';

export default function LockPage() {
  return (
    <>
      <h1>Educational Screen Lock</h1>
      <p className="muted">Answer correctly to unlock. Every correct answer adds to your skill progress.</p>
      <ScreenLock />
    </>
  );
}
