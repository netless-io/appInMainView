 
import {useState, useContext} from 'react';
import { Popover, Button, FloatButton, Flex} from 'antd';
import { BuiltinApps } from '@netless/window-manager';
import React from 'react';
import { AppstoreOutlined, ClockCircleOutlined, FileMarkdownOutlined, FilePdfOutlined, FilePptOutlined, FileWordOutlined } from '@ant-design/icons';
import { AppContext } from '../App';

const AppTools = () => {
    const [docsViewerIndex, setDocsViewerIndex] = useState<number>(1);
    const [pptViewerIndex, setPptViewerIndex] = useState<number>(1);
    const [mediaViewerIndex, setMediaViewerIndex] = useState<number>(1);
    const {setAppId, setAppRemark, setAppScenePath} = useContext(AppContext);
    const insertDocsViewer = async (): Promise<void> => {
        setDocsViewerIndex(docsViewerIndex+1);
        await window.manager.addApp({
            kind: BuiltinApps.DocsViewer,
            options: {
                scenePath: `/${BuiltinApps.DocsViewer}/${docsViewerIndex}`,
                title: `Static PDF-${docsViewerIndex}`,
                scenes: [
                    {
                        name: "1",
                        ppt: {
                            height: 1010,
                            src: "https://convertcdn.netless.link/staticConvert/18140800fe8a11eb8cb787b1c376634e/1.png",
                            width: 714,
                        },
                    },
                    {
                        name: "2",
                        ppt: {
                            height: 1010,
                            src: "https://convertcdn.netless.link/staticConvert/18140800fe8a11eb8cb787b1c376634e/2.png",
                            width: 714,
                        },
                    },
                    {
                        name: "3",
                        ppt: {
                            height: 1010,
                            src: "https://convertcdn.netless.link/staticConvert/00a244504ae311ee8180f740d6754c0e/28.png",
                            width: 714,
                        },
                    },
                    {
                        name: "4",
                        ppt: {
                            height: 1010,
                            src: "https://convertcdn.netless.link/staticConvert/00a244504ae311ee8180f740d6754c0e/32.png",
                            width: 714,
                        },
                    },
                    {
                        name: "5",
                        ppt: {
                            height: 1010,
                            src: "https://convertcdn.netless.link/staticConvert/00a244504ae311ee8180f740d6754c0e/33.png",
                            width: 714,
                        },
                    },
                    {
                        name: "6",
                        ppt: {
                            height: 1010,
                            src: "https://convertcdn.netless.link/staticConvert/00a244504ae311ee8180f740d6754c0e/24.png",
                            width: 714,
                        },
                    },
                ],  
            },
            // mutualPlugin: window.appliancePlugin
        });
    };
    const insertPptViewer1 = async (): Promise<void> => {
        setPptViewerIndex(pptViewerIndex+1);
        const scenePath = `/ppt/4d9409def2a24dab97034fc7ab5ef5c5/${pptViewerIndex}`;
        const pptId = await window.manager.addApp({
            kind: "Slide",
            options: {
                scenePath: scenePath, // [1]
                title: `test.pptx-${pptViewerIndex}`,
            },
            attributes: {
                taskId: "4d9409def2a24dab97034fc7ab5ef5c5", // [2]
                url: 'https://conversion-demo-cn.oss-cn-hangzhou.aliyuncs.com/demo/dynamicConvert', // [3]
            },
            // mutualPlugin: window.appliancePlugin
        });
        const remark = await fetch('https://conversion-demo-cn.oss-cn-hangzhou.aliyuncs.com/demo/dynamicConvert/4d9409def2a24dab97034fc7ab5ef5c5/jsonOutput/note.json').then((response) => {
            return response.json();
        })
        setAppId(pptId);
        setAppRemark(remark);
        setAppScenePath(scenePath)
    };
    const insertMediaViewer = async (): Promise<void> => {
        setMediaViewerIndex(mediaViewerIndex + 1);
        await window.manager.addApp({
            kind: BuiltinApps.MediaPlayer,
            options: {
                title: `MediaPlayer-${mediaViewerIndex}`,
            },
            attributes: {
                src: "https://developer-assets.netless.link/Zelda.mp4",
            },
        });
    };
    const insertCountDownViewer = async(): Promise<void> => {
        // setMediaViewerIndex(mediaViewerIndex + 1);
        await window.manager.addApp({
            kind: 'Countdown',
            options: { 
                title: `Countdown-${Math.floor(Math.random() * 1000)}`,
            },
        });
    };
    const insertQuillViewer = async(): Promise<void> => {
        await window.manager.addApp({
            kind: 'Quill',
            options: { 
                title: `Quill-${Math.floor(Math.random() * 1000)}`,
            },
        });
    };
    // const insertWordViewer = async(): Promise<void> => {
    //     const url = window.prompt(
    //         "Enter Google Doc Share URL",
    //         "https://docs.google.com/document/d/1bd4SRb5BmTUjPGrFxU2V7KI2g_mQ-HQUBxKTxsEn5e4/edit?usp=sharing"
    //       );
    //       if (!url) return;
    //     await window.manager.addApp({
    //         kind: "EmbeddedPage",
    //         options: { title: "Google Docs" },
    //         attributes: {
    //             src: url,
    //         },
    //     });
    // }
    return <div>
            <Flex>
                <Button 
                    type={'text'} 
                    icon={<FilePdfOutlined />} 
                    onClick={insertDocsViewer}
                />
                <Button 
                    type={'text'} 
                    icon={<FileMarkdownOutlined />} 
                    onClick={insertMediaViewer}
                />
                <Button 
                    type={'text'} 
                    icon={<FilePptOutlined />} 
                    onClick={insertPptViewer1}
                />
                <Button 
                    type={'text'} 
                    icon={<ClockCircleOutlined />} 
                    onClick={insertCountDownViewer}
                />
                <Button 
                    type={'text'} 
                    icon={<FileWordOutlined />} 
                    onClick={insertQuillViewer}
                />
                {/* <Button 
                    type={'text'} 
                    icon={<FileWordOutlined />} 
                    onClick={insertWordViewer}
                /> */}
            </Flex>
        </div>
}

export const AppButtons = () => {
    const [open, setOpen] = useState(false);
    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
    };
    return (
        <Popover
            content={<AppTools/>}
            placement="right"
            open={open}
            onOpenChange={handleOpenChange}
        >
            <FloatButton 
                type={'default'} 
                icon={<AppstoreOutlined />}
            />
        </Popover>
    )
}