import { useEffect, useRef } from "react";
import { useGoogleOAuth } from "@react-oauth/google";

let initializedClientId = null;
let activeButton = null;

const extractClientId = (response) => response?.clientId ?? response?.client_id;

const initializeGoogleIdentity = (clientId) => {
  if (initializedClientId === clientId) return;

  window.google?.accounts?.id?.initialize({
    client_id: clientId,
    callback: (response) => {
      if (!response?.credential) {
        activeButton?.onError?.();
        return;
      }

      activeButton?.onSuccess?.({
        credential: response.credential,
        clientId: extractClientId(response),
        select_by: response.select_by,
      });
    },
  });

  initializedClientId = clientId;
};

export default function GoogleCredentialButton({
  onSuccess,
  onError,
  text = "continue_with",
  shape = "rectangular",
  width,
}) {
  const containerRef = useRef(null);
  const handlersRef = useRef({ onSuccess, onError });
  const ownerRef = useRef(Symbol("google-credential-button"));
  const { clientId, locale, scriptLoadedSuccessfully } = useGoogleOAuth();

  handlersRef.current = { onSuccess, onError };

  useEffect(() => {
    const registration = {
      owner: ownerRef.current,
      onSuccess: (...args) => handlersRef.current.onSuccess?.(...args),
      onError: (...args) => handlersRef.current.onError?.(...args),
    };

    activeButton = registration;

    return () => {
      if (activeButton?.owner === registration.owner) {
        activeButton = null;
      }
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const googleIdentity = window.google?.accounts?.id;

    if (!container || !scriptLoadedSuccessfully || !googleIdentity) return;

    initializeGoogleIdentity(clientId);
    container.replaceChildren();
    googleIdentity.renderButton(container, {
      type: "standard",
      theme: "outline",
      size: "large",
      text,
      shape,
      width,
      locale,
    });
  }, [clientId, locale, scriptLoadedSuccessfully, shape, text, width]);

  return <div ref={containerRef} />;
}
