import React from 'react';

interface SkeletonProps {
  /**
   * Variant determines the shape and purpose
   * - text: Single line of text
   * - title: Larger heading text
   * - rect: Rectangular block (buttons, cards)
   * - circle: Circular (avatars, icons)
   * - thumbnail: Square image placeholder
   */
  variant?: 'text' | 'title' | 'rect' | 'circle' | 'thumbnail';
  /**
   * Width in tailwind units or custom value
   */
  width?: string;
  /**
   * Height in tailwind units or custom value
   */
  height?: string;
  /**
   * Number of repeated skeleton elements (for lists)
   */
  count?: number;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Skeleton component for loading states
 * Provides visual placeholder during data fetching
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  count = 1,
  className = '',
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700';

  const variantClasses = {
    text: 'h-4 rounded',
    title: 'h-8 rounded',
    rect: 'rounded-md',
    circle: 'rounded-full',
    thumbnail: 'aspect-square rounded-md',
  };

  const getStyle = () => {
    const style: React.CSSProperties = {};
    if (width) style.width = width;
    if (height) style.height = height;
    return style;
  };

  const skeletonElement = (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={getStyle()}
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );

  if (count === 1) {
    return skeletonElement;
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="mb-2 last:mb-0">
          {skeletonElement}
        </div>
      ))}
    </>
  );
};

/**
 * Skeleton preset for table rows
 */
export const SkeletonTableRow: React.FC<{ columns: number }> = ({ columns }) => {
  return (
    <tr className="border-b border-gray-200">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-4 py-3">
          <Skeleton variant="text" width="100%" />
        </td>
      ))}
    </tr>
  );
};

/**
 * Skeleton preset for grid items (assets, cards)
 */
export const SkeletonGridItem: React.FC = () => {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <Skeleton variant="thumbnail" width="100%" className="mb-3" />
      <Skeleton variant="title" width="80%" className="mb-2" />
      <Skeleton variant="text" width="60%" />
    </div>
  );
};

/**
 * Skeleton preset for list items
 */
export const SkeletonListItem: React.FC = () => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-2">
      <div className="flex items-start gap-4">
        <Skeleton variant="circle" width="48px" height="48px" />
        <div className="flex-1">
          <Skeleton variant="title" width="70%" className="mb-2" />
          <Skeleton variant="text" width="90%" className="mb-1" />
          <Skeleton variant="text" width="60%" />
        </div>
      </div>
    </div>
  );
};
