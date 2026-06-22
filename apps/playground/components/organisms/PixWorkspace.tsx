'use client';

import { DocumentWorkspace } from '@/components/organisms/DocumentWorkspace';
import { PixQrBuilder } from '@/components/organisms/PixQrBuilder';

export function PixWorkspace() {
  return (
    <DocumentWorkspace
      slug="pix"
      renderAfter={({ input }) => <PixQrBuilder pixKey={input} />}
    />
  );
}
