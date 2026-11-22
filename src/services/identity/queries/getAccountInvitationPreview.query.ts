import { hashOneTimeToken } from '../../../lib/security/oneTimeToken.js';
import type { AuthDependencies } from '../../../types/authDependencies.type.js';

export async function getAccountInvitationPreviewQuery(dependencies: AuthDependencies, token: string) {
  const tokenHash = hashOneTimeToken(token);
  const staff = await dependencies.staffRepository.previewStaffInvitation(tokenHash, new Date());
  if (staff) return { ...staff, kind: staff.role };
  const procurer = await dependencies.identityRepository.getInvitationPreview(tokenHash, new Date());
  return procurer ? { ...procurer, kind: 'PROCURER' as const } : null;
}
