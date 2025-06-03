/* eslint-disable @typescript-eslint/no-explicit-any */
import styles from './index.module.less';
import React from 'react';

const ScenePreview = React.forwardRef((_props:any, ref: React.ForwardedRef<HTMLDivElement>) => {
    return (
        <div className={styles['ScenePreview']} ref={ref} id="previewBox"></div>
    )
});

export default ScenePreview;