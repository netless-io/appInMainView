/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from 'react'
import ReactDOM from 'react-dom'
import './index.css';
import '@netless/window-manager/dist/style.css';
import '@netless/appliance-plugin/dist/style.css';
import '@netless/app-in-mainview-plugin/dist/style.css';
import {
  createHashRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  useLoaderData
} from "react-router-dom";
import { WindowManager } from "@netless/window-manager";
import { WhiteWebSdk, DeviceType } from "white-web-sdk";
import IndexPage from '.';
import { AppInMainViewPlugin } from '@netless/app-in-mainview-plugin';
import App from './view/App';
import fullWorkerString from '@netless/appliance-plugin/dist/fullWorker.js?raw';
import subWorkerString from '@netless/appliance-plugin/dist/subWorker.js?raw';
import { ApplianceMultiPlugin } from '@netless/appliance-plugin';
import SlideApp, { addHooks } from "@netless/app-slide";

const appIdentifier = '123456789/987654321';
const region = 'cn-hz';
async function createMultiWhiteWebSdk(params:{
  elm:HTMLDivElement;
  uuid:string;
  roomToken:string;
  appIdentifier:string;
  uid: string;
  isWritable: boolean;
}) {
  const {elm, uuid, roomToken, appIdentifier, uid, isWritable} = params;
  const whiteWebSdk = new WhiteWebSdk({
      appIdentifier,
      useMobXState: true,
      deviceType: DeviceType.Surface,
  })
  const room = await whiteWebSdk.joinRoom({
      uuid,
      roomToken,
      uid,
      region,
      isWritable,
      floatBar: true,
      userPayload: {
          nickName: isWritable ? `teacher-${uid}` : `studenr-${uid}`,
      },
      invisiblePlugins: [WindowManager as any, ApplianceMultiPlugin, AppInMainViewPlugin],
      disableNewPencil: false,
      useMultiViews: true, 
  })
  if (room.isWritable) {
      room.setScenePath("/init");
  }
  WindowManager.register({
      kind: "Slide",
      src: SlideApp,
      addHooks,
  });
  WindowManager.register({
      kind: "Quill",
      src: ()=>import('@netless/app-quill')
  });
  WindowManager.register({
      kind: "Countdown",
      src: "https://netless-app.oss-cn-hangzhou.aliyuncs.com/@netless/app-countdown/0.0.2/dist/main.iife.js",
  });
  const manager = await WindowManager.mount({ 
    room, 
    container:elm, 
    chessboard: true, 
    cursor: true, 
    supportAppliancePlugin: true,
    prefersColorScheme: 'dark'

  });
  if (manager) {
    const appInMainViewPlugin = await AppInMainViewPlugin.getInstance(manager as any, {
      language: "en",
      onlyShowHidden: true,
      // enableDefaultUI: false,
    });
    const fullWorkerBlob = new Blob([fullWorkerString], {type: 'text/javascript'});
    const fullWorkerUrl = URL.createObjectURL(fullWorkerBlob);
    const subWorkerBlob = new Blob([subWorkerString], {type: 'text/javascript'});
    const subWorkerUrl = URL.createObjectURL(subWorkerBlob);
    const appliancePlugin = await ApplianceMultiPlugin.getInstance(manager,
        {   // 获取插件实例，全局应该只有一个插件实例，必须在 joinRoom 之后调用
            options: {
                cdn: {
                    // useWorker: "mainThread",
                    fullWorkerUrl,
                    subWorkerUrl
                },
                bezier: {
                    combineUnitTime: 300,
                    maxDrawCount: 180
                },
                textEditor: {
                    showFloatBar: false,
                    canSelectorSwitch: false,
                    rightBoundBreak: true
                }
            }
        }
    );
    if (isWritable) {
        room.disableSerialization = false;
    }
    Object.assign(window, { manager, appliancePlugin, room, appInMainViewPlugin});
  }
}

async function createUid(params:{
  uuid:string;
  roomToken:string;
  appIdentifier:string;
  page: "window-manager" | "fastboard";
}) {
  const { uuid, roomToken, appIdentifier, page} = params;
  const sUid = sessionStorage.getItem('uid');
  // 默认"1234"是可写的
  const isWritable = !!(sUid && sUid.indexOf('1234') > 0);
  const uid = sUid || 'uid-' + Math.floor(Math.random() * 10000);
  if (!sUid) {
      sessionStorage.setItem('uid', uid); 
  }
  if (page === "window-manager") {
    await createMultiWhiteWebSdk({
      elm: document.getElementById('whiteboard') as HTMLDivElement,
      uuid,
      roomToken,
      appIdentifier,
      uid,
      isWritable
    });
  }
  return { uuid, roomToken, appIdentifier, uid, isWritable, page };
}

const Container = () => {
  const {uuid, roomToken, uid, isWritable, page} = useLoaderData() as any;
  console.log(uuid, roomToken, uid, isWritable, page);
  const whiteboard = useMemo(()=>{
    if (page === "window-manager") {
      return <>
        <App/>
      </>
    }
    if (page === "fastboard") {
      // todo
      return <div>fastboard</div>
    }
    return null
  },[page])
  

  return <div className='whiteboard-container'>
    { whiteboard }
  </div>
};

const routerData = createHashRouter(createRoutesFromElements(
  <Route>
    <Route path="/" element={<IndexPage/>} />
    <Route path="/window-manager" loader={({request})=>{
        const url = new URL(request.url);
        const uuid = url.searchParams.get("uuid");
        const roomToken = url.searchParams.get("roomToken");
        if (uuid && roomToken) {
          if (window.fastboardUI) {
            window.fastboardUI.destroy();
          }
          if (window.manager) {
            window.manager.destroy();
          }
          return createUid({uuid, roomToken, appIdentifier, page: "window-manager"});
        }
        return {};
    }} element={<Container/>} />
    <Route path="/fastboard" loader={({request})=>{
        const url = new URL(request.url);
        const uuid = url.searchParams.get("uuid");
        const roomToken = url.searchParams.get("roomToken");
        if (uuid && roomToken) {
          if (window.fastboardUI) {
            window.fastboardUI.destroy();
          }
          if (window.manager) {
            window.manager.destroy();
          }
          return createUid({uuid, roomToken, appIdentifier, page: "fastboard"});
        }
        return {};
    }} element={<Container/>} />
  </Route>
))
ReactDOM.render(
  <React.StrictMode>
    <RouterProvider router={routerData} />
  </React.StrictMode>, document.getElementById('root') as HTMLElement
)