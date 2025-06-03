/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import './App.css';
import React, { useState, useEffect, createContext, useMemo} from 'react';
import { FloatTools } from './floatTools';
import { ZoomController } from './zoomController';
import { isRoom } from 'white-web-sdk'
import { EStrokeType, MemberState, ShapeType, ApplianceNames, EToolsKey } from '@netless/appliance-plugin';
import { AppliancePluginInstance, EForceStopReason, Room, RoomMember, RoomState } from '@netless/appliance-plugin';
import ScenePreview from './scenePreview';
import { Button, message } from 'antd';
import type { View, WindowManager } from '@netless/window-manager';
import { PageController } from './pageController';

export const AppContext = createContext<{
  toolsKey:EToolsKey;
  setToolsKey:(key:EToolsKey)=>void;
  beginAt:number;
  preViewRef: React.RefObject<HTMLDivElement>;
  // appId: string;
  // appRemark: any;
  // appScenePath: string;
  setAppId: (id:string)=>void;
  setAppRemark: (remark:any)=>void;
  setAppScenePath: (scenePath:string)=>void;
  roomMembers?: readonly RoomMember[];
} >({
  toolsKey: EToolsKey.Clicker,
  setToolsKey: () => {},
  beginAt: 0,
  preViewRef: React.createRef<HTMLDivElement>(),
  setAppId: () => {},
  setAppRemark: ()=> {},
  setAppScenePath: ()=>{},
  roomMembers:[]
});

export default function App() { 
  const [toolsKey, setToolsKey] = useState<EToolsKey>(EToolsKey.Clicker);
  const [isWritable, setWritable] = useState<boolean>(true);
  const [beginAt, setBeginAt] = useState<number>(0);
  const preViewRef = React.createRef<HTMLDivElement>();
  const [appId, setAppId] = useState<string>('');
  const [appRemark, setAppRemark] = useState<any>();
  const [appScenePath, setAppScenePath] = useState<string>('');
  const [url, getH5Url] = useState<string>('');
  const [roomMembers, setRoomMembers] = useState<readonly RoomMember[]>([]);

  function roomStateChangeListener(state: RoomState){
    if (isRoom(window.room) && !(window.room as Room).isWritable) {
        return;
    }
    if (state.memberState) {
      onMemberChange(state.memberState as MemberState);
    }
    if (state?.roomMembers) {
      onRoomMembersChange(state.roomMembers);
    }
  }
  const onRoomMembersChange = (roomMembers: readonly RoomMember[]) => {
    setRoomMembers(roomMembers)
  }
  const onMemberChange =(memberState:MemberState)=>{
    const {currentApplianceName, useLaserPen}= memberState;
    switch (currentApplianceName) {
      case ApplianceNames.pencil:
        if (useLaserPen) {
          setToolsKey(EToolsKey.LaserPen);
        }else {
          setToolsKey(EToolsKey.Pencil);
        }
        break;
      case ApplianceNames.arrow:
        setToolsKey(EToolsKey.Arrow);
        break;
      case ApplianceNames.clicker:
        setToolsKey(EToolsKey.Clicker);
        break;
      case ApplianceNames.selector:
        setToolsKey(EToolsKey.Selector);
        break;
      case ApplianceNames.ellipse:
        setToolsKey(EToolsKey.Ellipse);
        break;
      case ApplianceNames.eraser:
        setToolsKey(EToolsKey.Eraser);
        break;
      case ApplianceNames.pencilEraser:
        setToolsKey(EToolsKey.PencilEraser);
        break;
      case ApplianceNames.hand:
        setToolsKey(EToolsKey.Hand);
        break;
      case ApplianceNames.rectangle:
        setToolsKey(EToolsKey.Rectangle);
        break;
      case ApplianceNames.text:
        setToolsKey(EToolsKey.Text);
        break;
      case ApplianceNames.straight:
        setToolsKey(EToolsKey.Straight);
        break;
      default:
        break;
    }
  }
  function updateRoomWritable(){
    setWritable(window.room.isWritable);
  }
  function getAppRemarkListener(payloay:{appId: string;view: View}) {
    if (appRemark && appId && payloay.appId === appId && payloay.view.focusScenePath) {
      const pageIndex = payloay.view.focusScenePath.split(`${appScenePath}/`)[1];
      if (pageIndex && appRemark[pageIndex]) {
        for (const item of appRemark[pageIndex]) {
          const runItem = item && item.runs && item.runs.find((f: { text: string; })=>{
            return /^@@@(\S*)@@@$/.test(f.text)
          })
          if (runItem) {
            const urls = /^@@@(\S*)@@@$/.exec(runItem.text)
            if (urls && urls[1]) {
              getH5Url(urls[1]);
              break;
            }
          }
          getH5Url('');
        }
      }
    }
  }
  function forceStopListener(reason: EForceStopReason) {
    if (reason === EForceStopReason.longPencil) {
      message.info('画笔过长,请重新开始绘制');
    }
  }
  useEffect(()=>{
    setBeginAt(Date.now());
    updateRoomWritable();
    window.room?.callbacks.on('onRoomStateChanged', roomStateChangeListener);
    window.room?.callbacks.on("onEnableWriteNowChanged", updateRoomWritable);
    window.appliancePlugin?.addListener('forceStop', forceStopListener);
    return ()=>{
      window.room?.callbacks.off('onRoomStateChanged', roomStateChangeListener);
      window.room?.callbacks.off("onEnableWriteNowChanged", updateRoomWritable);
      window.appliancePlugin?.removeListener('forceStop', forceStopListener);
    }
  },[])

  useEffect(()=>{
    if (appId && appRemark && appScenePath) {
      (window.manager as WindowManager)?.emitter.on("onAppScenePathChange", getAppRemarkListener)
    }
    return ()=>{
      (window.manager as WindowManager)?.emitter.off("onAppScenePathChange", getAppRemarkListener)
    }

  },[appId, appRemark, appScenePath, getAppRemarkListener])
  
  // document.addEventListener("visibilitychange", () => {if (document.visibilityState === "visible") {setTimeout(()=>{_wm.queryAll()[0].view.fireReloadLibrary()},1000)}
  // _wm.queryAll()[0].view.pressedHotKeys
  // });
  useEffect(()=>{
      if (window.room) {
        const _object: AppliancePluginInstance = window.room || {};
        if (!window.room.isWritable) {
          return;
        }
        switch (toolsKey) {
          case EToolsKey.Text:
              _object.setMemberState({currentApplianceName: ApplianceNames.text});
              break;
          case EToolsKey.Pencil:
              _object.setMemberState({currentApplianceName: ApplianceNames.pencil, strokeType: EStrokeType.Stroke});
              break;
          case EToolsKey.Selector:
              _object.setMemberState({currentApplianceName: ApplianceNames.selector});
              break;
          case EToolsKey.Eraser:
              _object.setMemberState({currentApplianceName: ApplianceNames.eraser});
              break;
          case EToolsKey.PencilEraser:
            _object.setMemberState({currentApplianceName: ApplianceNames.pencilEraser, pencilEraserSize: 3, eraserColor: [256, 256, 256], eraserOpacity: 0.5});
            break;
          case EToolsKey.Clicker:
              _object.setMemberState({currentApplianceName: ApplianceNames.clicker});
              break;``
          case EToolsKey.LaserPen:
              _object.setMemberState({currentApplianceName: ApplianceNames.laserPen, strokeType: EStrokeType.Normal});
              break;
          case EToolsKey.Arrow:
              _object.setMemberState({currentApplianceName: ApplianceNames.arrow, arrowCompleteToSelector: true});
              break;
          case EToolsKey.Straight:
              _object.setMemberState({currentApplianceName: ApplianceNames.straight, straightCompleteToSelector: false});
              break; 
          case EToolsKey.Ellipse:
              _object.setMemberState({currentApplianceName: ApplianceNames.ellipse, ellipseCompleteToSelector: false});
              break;
          case EToolsKey.Rectangle:
              _object.setMemberState({currentApplianceName: ApplianceNames.rectangle, rectangleCompleteToSelector: false});
              break;
          case EToolsKey.Star:
              _object.setMemberState({currentApplianceName: ApplianceNames.shape, shapeType:ShapeType.Pentagram, shapeCompleteToSelector: false});
              break;
          case EToolsKey.Triangle:
              _object.setMemberState({currentApplianceName: ApplianceNames.shape, shapeType:ShapeType.Triangle, shapeCompleteToSelector: false});
              break;
          case EToolsKey.Rhombus:
              _object.setMemberState({currentApplianceName: ApplianceNames.shape, shapeType:ShapeType.Rhombus, shapeCompleteToSelector: false});
              break;
          case EToolsKey.SpeechBalloon:
              _object.setMemberState({currentApplianceName: ApplianceNames.shape, shapeType:ShapeType.SpeechBalloon, shapeCompleteToSelector: false});
              break;
          case EToolsKey.Hand:
              _object.setMemberState({currentApplianceName: ApplianceNames.hand});
              break;    
          default:
              break;  
        }
      }
  },[toolsKey])
  const remarkBtn = useMemo(()=>{
    if (url) {
      return <Button type='primary' style={{
          position:"fixed", 
          right:20, 
          top:30
        }} onClick={()=>{
        // todo 打开一个新的H5课件
        // window.open(url);
        const sUid = sessionStorage.getItem('uid');
        const isWritable = !!(sUid && sUid.indexOf('1234') > 0);
        const userid = isWritable && '082dcced-8b26-afc7-f2de-5afc8d1214d3' || sUid;
        window.manager.addApp({
          kind: "Talkative",
          options: {
            title: "Custom Title",
            scenePath: '/825d0c10-2309-453a-9e5c-4576c6c85172'
          },
          attributes: {
            src: `https://interactive-live-test.wukongedu.net/825d0c10-2309-453a-9e5c-4576c6c85172?accessToken=tDUw8uCfRimbi9yJ38VDM4KDqAaYCN6EwW6cYho&fileid=1311294700002&serial=1401661200&isH5MediaOutput=false&lang=zh&stage=formal&thirdroomid=35323b8a-8172-4455-b749-95e6f5ba261c&isBackEvent=false&h5docpar=&roomtype=`,
            uid: isWritable && userid, // optional
            displaySceneDir: `/825d0c10-2309-453a-9e5c-4576c6c85172`
          },
        });
      }}>超链接</Button>
    }
    return null;
  },[url])
  if (!isWritable) {
    return null;
  }
  return (
    <div className='App' onMouseDown={(e)=>{
      e.stopPropagation();
    }}>
      <AppContext.Provider value={{roomMembers, toolsKey, setToolsKey, beginAt, preViewRef, setAppId, setAppRemark, setAppScenePath}}>
        <FloatTools/>
        <ZoomController/>
        <ScenePreview ref={preViewRef}/>
        {remarkBtn}
        <PageController />
      </AppContext.Provider>
    </div>
  )
}