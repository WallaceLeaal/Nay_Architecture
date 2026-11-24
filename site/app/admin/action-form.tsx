"use client";

import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import { isRedirectError } from "next/dist/client/components/redirect-error";

type Feedback = { error?: string; message?: string };

export default function ActionForm({ action, submit, children, resetOnSuccess = false }: {
  action: (form: FormData) => Promise<Feedback>;
  submit: string;
  children: ReactNode;
  resetOnSuccess?: boolean;
}) {
  const [feedback, setFeedback] = useState<Feedback>({});
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setFeedback({});
    startTransition(async () => {
      try {
        const result = await action(data);
        if (resetOnSuccess && !result.error) form.reset();
        setFeedback(result);
      } catch (error) {
        if (isRedirectError(error)) throw error;
        setFeedback({ error: "Não foi possível enviar. Confira sua conexão e o tamanho do arquivo." });
      }
    });
  }

  return (
    <form method="post" onSubmit={handleSubmit} className="admin-form">
      <fieldset disabled={pending}>
        {children}
        <button className="button panel-button" type="submit">{pending ? "Salvando…" : submit}</button>
      </fieldset>
      {feedback.error && <p role="alert" className="form-error">{feedback.error}</p>}
      {feedback.message && <p role="status">{feedback.message}</p>}
    </form>
  );
}
