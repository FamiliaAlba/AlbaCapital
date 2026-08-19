-- Create newsletter_subscribers table
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  locale TEXT DEFAULT 'es-AR',
  source TEXT DEFAULT 'blog',
  consent BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'subscribed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT newsletter_email_unique UNIQUE (email),
  CONSTRAINT newsletter_email_length CHECK (char_length(email) BETWEEN 5 AND 255),
  CONSTRAINT newsletter_email_format CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  CONSTRAINT newsletter_locale_length CHECK (locale IS NULL OR char_length(locale) <= 10),
  CONSTRAINT newsletter_source_length CHECK (source IS NULL OR char_length(source) <= 50),
  CONSTRAINT newsletter_status_valid CHECK (status IN ('subscribed', 'unsubscribed')),
  CONSTRAINT newsletter_consent_required CHECK (consent = true)
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone (anon) can subscribe. Duplicate emails are rejected by the
-- UNIQUE constraint (returns a 23505 error the client treats as
-- "ya estás suscripto" instead of a generic failure).
CREATE POLICY "Anyone can subscribe to the newsletter"
  ON public.newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(email) BETWEEN 5 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND consent = true
  );

-- No public read/update/delete policy: only service role (admin) can
-- manage subscribers, list them, or process unsubscribes.

CREATE INDEX idx_newsletter_created_at ON public.newsletter_subscribers(created_at DESC);
