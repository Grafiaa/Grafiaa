import { useEffect, useState } from 'react';
import { quemEntrou } from './api';
import { MinhasFontes } from './MinhasFontes';
import { TelaEntrar } from './TelaEntrar';

export function App() {
  // undefined: ainda perguntando ao servidor; null: ninguém entrou.
  const [email, setEmail] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    quemEntrou().then(setEmail);
  }, []);

  if (email === undefined) return null;
  return email ? <MinhasFontes email={email} /> : <TelaEntrar aoEntrar={setEmail} />;
}
