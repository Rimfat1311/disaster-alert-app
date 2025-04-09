// ./components/ExtensionCleanup.tsx
'use client';

import { useEffect } from 'react';

export default function ExtensionCleanup() {
  useEffect(() => {         
    // Remove Grammarly-specific attributes
    document.body.removeAttribute('data-new-gr-c-s-check-loaded');
    document.body.removeAttribute('data-gr-ext-installed');
    
    // Prevent future extension modifications
    document.body.setAttribute('data-gramm', 'false');
    document.body.setAttribute('data-gramm_editor', 'false');
  }, []);

  return null;
}