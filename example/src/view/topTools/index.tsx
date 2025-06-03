/* eslint-disable @typescript-eslint/no-explicit-any */
import styles from './index.module.less';
import { LogoutOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Space } from 'antd';
import type { Player } from 'white-web-sdk';
import { WindowManager } from '@netless/window-manager';
import React from 'react';

export const ReplayerTopTools = () => {
    const handleGoBack = async() => {
        (window.player as Player).stop();
        if (window.manager) {
            (window.manager as WindowManager).destroy();
            window.manager = undefined;
            window.appliancePlugin?.destroy();
        } 
        window.location.href= `${document.location.origin}${document.location.pathname}`;
    }
    return (
        <div className={styles['TopTools']}>
            <Space.Compact>
                <Popconfirm
                    placement="rightBottom"
                    title={'退出'}
                    description={'是否退出?'}
                    okText="退出"
                    cancelText="取消"
                    onConfirm={handleGoBack}
                >
                    <Button icon={<LogoutOutlined />}/>
                </Popconfirm>
            </Space.Compact>
        </div>
    )
}