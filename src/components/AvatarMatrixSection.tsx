import React, { memo } from 'react';
import { PremiumAvatar } from '../data/presetAvatars';
import { PremiumAvatarMatrix } from './PremiumAvatarMatrix';

interface AvatarMatrixSectionProps {
  currentAvatarUrl?: string | null;
  activeColorHex: string;
  onSelectAvatar: (avatar: PremiumAvatar) => void;
}

export const AvatarMatrixSection: React.FC<AvatarMatrixSectionProps> = memo(
  ({ currentAvatarUrl, activeColorHex, onSelectAvatar }) => {
    return (
      <PremiumAvatarMatrix
        currentAvatarUrl={currentAvatarUrl}
        activeColorHex={activeColorHex}
        onSelectAvatar={onSelectAvatar}
      />
    );
  }
);

AvatarMatrixSection.displayName = 'AvatarMatrixSection';

