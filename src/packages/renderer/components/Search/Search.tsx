import React, { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  updateSessions,
  updateSelectedFile,
  updateCurrentFaces,
  updateCurrectMatches,
  updateFetchingMatches,
} from "../../reducers/search";
import { Button, message, Radio, RadioChangeEvent } from "antd";
// eslint-disable-next-line import/no-unresolved
import { OpenDialogReturnValue } from "electron/main";
import {
  ImageDiv,
  ImagePreview,
  QueryFaces,
  QueryFacesWrapper,
  QuerySelection,
  ResultFaces,
  ResultImageContainer,
  SearchContainer,
} from "./styles";
import { InboxOutlined } from "@ant-design/icons";
import {
  LumosDragger,
  LumosText,
  LumosTitle,
} from "../../css/ant-design-custom";
import { AiOutlineDelete, AiOutlineSelect } from "react-icons/ai";
// import path from "path";
import { blue, red } from "@ant-design/colors";
import { SessionBlob } from "../../../electron/DB/session";
const ipcRenderer = (window as any).electron.ipcRenderer;
const { pathToFileURL } = (window as any).url;

export const Search = () => {
  const dispatch = useAppDispatch();
  const [queryFace, setQueryFace] = useState("");
  const {
    sessions,
    selectedFile,
    currentFaces,
    currentSession,
    currentMatches,
    fetchingMatches,
  } = useAppSelector((state) => state.search);

  const fileSelected = useCallback((_, res: OpenDialogReturnValue) => {
    if (!res.canceled) {
      message.open({
        type: "info",
        content: `Image selection success!`,
        style: {
          marginTop: 32,
        },
        duration: 1,
      });
      dispatch(updateCurrectMatches([]));
      dispatch(updateCurrentFaces([]));
      dispatch(updateSelectedFile(res.filePaths[0]));
    }
  }, []);

  const getFacesCallback = useCallback((_, faces: string[]) => {
    if (faces.length) {
      setQueryFace(faces[0]);
    }
    dispatch(updateCurrentFaces(faces));
  }, []);

  const getMatchesCallback = useCallback((_, response) => {
    dispatch(updateFetchingMatches(false));
    dispatch(updateCurrectMatches(response));
  }, []);

  useEffect(() => {
    const run = async () => {
      const sessions: SessionBlob[] = await (window as any).db.getAllSessions();
      console.log(sessions);
      dispatch(updateSessions(sessions));
    };
    run();
  }, []);

  useEffect(() => {
    ipcRenderer.on("selected-query-file", fileSelected);
    ipcRenderer.on("get-faces", getFacesCallback);
    ipcRenderer.on("get-matches", getMatchesCallback);

    return () => {
      ipcRenderer.off("selected-query-file", fileSelected);
      ipcRenderer.off("get-faces", getFacesCallback);
      ipcRenderer.off("get-matches", getMatchesCallback);
    };
  }, []);

  const selectFile = () => {
    ipcRenderer.send("select-query-file");
  };

  const getFaces = () => {
    ipcRenderer.send("get-faces", selectedFile);
  };

  const faceSelect = (evt: RadioChangeEvent) => {
    setQueryFace(evt.target.value);
  };

  const findMatch = () => {
    dispatch(updateFetchingMatches(true));
    const data = {
      facePath: queryFace ? queryFace : currentFaces[0],
      session: currentSession ? currentSession : sessions[0],
    };

    console.log(data);
    ipcRenderer.send("get-matches", data);
  };

  const handleContentMenu = (e: any, path: string) => {
    e.preventDefault();
    console.log("handle context menu");
    ipcRenderer.send("show-context-menu-face-search-result", path);
  };

  return (
    <SearchContainer>
      <QuerySelection>
        <LumosDragger>
          <p className="ant-upload-drag-icon" onClick={selectFile}>
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            <h4>Click or drag file to this area to select/reselect</h4>
          </p>
          <p className="ant-upload-hint">
            Support for a single file selection. If dragged multiple then first
            file will be selected. Click on extract face
          </p>
          {selectedFile && (
            <p className="selected-file-preview">
              <ImagePreview>
                <ImageDiv
                  src={pathToFileURL(selectedFile)}
                  height={45}
                  width={45}
                />
                {/* <p className="filename">{path.basename(selectedFile)}</p> */}
                <AiOutlineDelete
                  style={{ color: red[5], cursor: "pointer", fontSize: 16 }}
                  onClick={() => {
                    dispatch(updateSelectedFile(""));
                    dispatch(updateCurrectMatches([]));
                    dispatch(updateCurrentFaces([]));
                  }}
                />
              </ImagePreview>
              <Button type="primary" onClick={getFaces}>
                Extract Faces
              </Button>
            </p>
          )}
        </LumosDragger>
      </QuerySelection>
      <QueryFaces>
        {currentFaces.length && (
          <QueryFacesWrapper>
            <AiOutlineSelect
              fontSize={30}
              color={blue.primary}
              className="icon"
            />
            <LumosTitle style={{ fontSize: 16, justifySelf: "center" }}>
              Select face
            </LumosTitle>
            <Radio.Group
              defaultValue={currentFaces[0]}
              onChange={faceSelect}
              className="radioGroup"
            >
              {currentFaces.map((face) => (
                <Radio value={face}>
                  <img height={60} src={`file://${face}`} alt="" />
                </Radio>
              ))}
            </Radio.Group>
            <Button
              type="primary"
              onClick={findMatch}
              loading={fetchingMatches}
            >
              Find Matches
            </Button>
          </QueryFacesWrapper>
        )}
      </QueryFaces>
      <ResultFaces>
        {currentMatches.map((match) => (
          <ResultImageContainer
            onContextMenu={(e) => handleContentMenu(e, match.filePath)}
          >
            <ImageDiv src={pathToFileURL(match.filePath)} />
            <LumosText
              style={{
                fontSize: 12,
                fontWeight: "bold",
                textAlign: "center",
                userSelect: "none",
              }}
            >
              {/* {path.basename(match.filePath)} */}
            </LumosText>
          </ResultImageContainer>
        ))}
      </ResultFaces>
    </SearchContainer>
  );
};
