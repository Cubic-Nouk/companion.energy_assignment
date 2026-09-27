import styles from './App.module.css'

export function App() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <span className={styles.brand}>Companion.energy</span>
        <span className={styles.section}>Contracts</span>
      </header>
      <main className={styles.main}>
        <h1>Contracts prototype</h1>
      </main>
    </div>
  )
}
