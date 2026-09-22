import { colors } from '../tokens';
import { ApplicationStatus } from '../../../shared-types/src';

export interface StatusPillProps {
  status: ApplicationStatus | 'valid' | 'expired' | 'revoked';
  isDarkMode?: boolean;
}

export function getStatusPillColors(status: ApplicationStatus | 'valid' | 'expired' | 'revoked', isDarkMode = false) {
  switch (status) {
    case 'Submitted':
      return {
        background: isDarkMode ? '#334155' : colors.statusSubmittedBg,
        color: isDarkMode ? '#CBD5E1' : colors.statusSubmittedText,
        label: 'Submitted'
      };
    case 'Scheduled':
      return {
        background: isDarkMode ? '#1E3A8A' : colors.statusScheduledBg,
        color: isDarkMode ? '#93C5FD' : colors.statusScheduledText,
        label: 'Scheduled'
      };
    case 'Inspected':
      return {
        background: isDarkMode ? '#78350F' : colors.statusInspectedBg,
        color: isDarkMode ? '#FDE68A' : colors.statusInspectedText,
        label: 'Inspected'
      };
    case 'Certified':
    case 'valid':
      return {
        background: isDarkMode ? '#064E3B' : colors.statusCertifiedBg,
        color: isDarkMode ? '#A7F3D0' : colors.statusCertifiedText,
        label: status === 'valid' ? 'Valid Certificate' : 'Certified'
      };
    case 'Rejected':
    case 'expired':
    case 'revoked':
      return {
        background: isDarkMode ? '#7F1D1D' : colors.statusRejectedBg,
        color: isDarkMode ? '#FCA5A5' : colors.statusRejectedText,
        label: status === 'expired' ? 'Expired Certificate' : status === 'revoked' ? 'Revoked Certificate' : 'Rejected'
      };
    default:
      return {
        background: colors.statusSubmittedBg,
        color: colors.statusSubmittedText,
        label: String(status)
      };
  }
}
