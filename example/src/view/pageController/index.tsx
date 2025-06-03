import styles from './index.module.less';
import { useState, useEffect } from 'react';
import { LeftOutlined, RightOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';
import React from 'react';
import { PageState } from '@netless/window-manager';

export const PageController = () => {
    const [pageIndex, setPageIndex] = useState(1);
    const [pageLength, setPageLength] = useState(1);

    const handlePageStateChange = (pageState: PageState) => {
        setPageIndex(pageState.index + 1);
        setPageLength(pageState.length);
    }
    useEffect(()=>{
        setPageIndex(window.manager.pageState.index+1);
        setPageLength(window.manager.pageState.length);
        window.manager.emitter.on('pageStateChange', handlePageStateChange)
        return ()=>{
            window.manager.emitter.off('pageStateChange', handlePageStateChange)
        }
    },[])

    const prevPage = () => {
        window.manager.prevPage();
    }
    const nextPage = () => {
        window.manager.nextPage();
    }

    const addPage = () => {
        window.manager.addPage();
    }

    return (
        <div className={styles['PageController']}>
            <Space.Compact>
                <Button icon={<LeftOutlined />} onClick={prevPage}/>
                <Button>{pageIndex}/{pageLength}</Button>
                <Button icon={<RightOutlined />} onClick={nextPage}/>
                <Button icon={<PlusOutlined />} onClick={addPage}/>
            </Space.Compact>
        </div>
    )
}