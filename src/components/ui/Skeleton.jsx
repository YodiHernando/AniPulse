import React from 'react';

const Skeleton = ({ className, ...props }) => {
    return (
        <div
            className={`animate-pulse rounded-md bg-slate-800/50 ${className}`}
            {...props}
        />
    );
};

export { Skeleton };
