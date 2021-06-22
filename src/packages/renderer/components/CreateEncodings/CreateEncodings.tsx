import React, { useCallback, useEffect, useContext } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  update,
  updateCurrentTip,
  updateIndexingStarted,
  updateFinished,
  updateRecentSessionId,
} from "../../reducers/createEncodings";
import { Button } from "antd";
import { Container, Finish, Progress, SelectionControl } from "./styles";
import {
  LumosTitle,
  LumosParagraph,
  LumosText,
  LumosSpin,
} from "../../css/ant-design-custom";
import { VscFolderOpened } from "react-icons/vsc";
import { IoMdCheckmark } from "react-icons/io";
import { ThemeContext } from "../../App";

export const CreateEncodings = () => {
  const ipcRenderer = (window as any).electron.ipcRenderer;
  const dispatch = useAppDispatch();
  const {
    direcorySource,
    currentTip,
    indexingStarted,
    finished,
    recentSessionId,
  } = useAppSelector((state) => state.createEncodings);
  const { theme } = useContext(ThemeContext);
  const directorySelected = Boolean(direcorySource);

  const open = () => {
    ipcRenderer.send("test");
  };

  const memoDirecortySelected = useCallback(
    (_: unknown, response: Electron.OpenDialogReturnValue) => {
      if (!response.canceled) {
        dispatch(update(response.filePaths[0]));
      }
    },
    [dispatch]
  );

  const memoEmbeddingsTipUpdate = useCallback(
    (_: unknown, response: string) => {
      dispatch(updateCurrentTip(response));
    },
    []
  );

  const memoEmbeddingsFinished = useCallback((_: unknown, response) => {
    dispatch(updateCurrentTip("All finished"));
    dispatch(updateIndexingStarted(false));
    dispatch(updateFinished(true));
    dispatch(updateRecentSessionId(response.sessionId));
  }, []);

  useEffect(() => {
    ipcRenderer.on("directory-selected", memoDirecortySelected);
    ipcRenderer.on("embeddings-tip-update", memoEmbeddingsTipUpdate);
    ipcRenderer.on("embeddings-finished", memoEmbeddingsFinished);

    return () => {
      ipcRenderer.off("directory-selected", memoDirecortySelected);
      ipcRenderer.off("embeddings-tip-update", memoEmbeddingsTipUpdate);
      ipcRenderer.off("embeddings-finished", memoEmbeddingsFinished);
    };
  }, [dispatch, memoDirecortySelected]);

  const startIndxing = () => {
    dispatch(updateCurrentTip("starting inedexing ..."));
    dispatch(updateIndexingStarted(true));
    ipcRenderer.send("start-images-indexing", direcorySource);
  };

  return (
    <Container>
      <LumosTitle level={1}>Powered by Lumos</LumosTitle>
      <LumosParagraph>
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eveniet
        suscipit dicta quibusdam eaque et praesentium vitae repudiandae maiores,
        ab neque sequi assumenda asperiores dolor ea, dignissimos velit quo,
        blanditiis est.
      </LumosParagraph>
      <SelectionControl>
        <VscFolderOpened
          style={{
            height: 30,
            width: 30,
            marginBottom: 8,
            gridArea: "icon",
          }}
        />
        <Button
          type={theme === "dark" ? "primary" : "default"}
          onClick={open}
          style={{
            width: 160,
            display: "flex",
            justifyContent: "space-evenly",
            gridArea: "select",
          }}
          disabled={indexingStarted}
        >
          <LumosText>Select Directory</LumosText>
          {directorySelected && (
            <IoMdCheckmark
              style={{
                color: "green",
                height: 20,
                width: 20,
              }}
            />
          )}
        </Button>
        {directorySelected && (
          <LumosText
            style={{
              marginTop: 8,
              width: 400,
              gridArea: "text",
              textAlign: "center",
            }}
            ellipsis
          >
            {direcorySource}
          </LumosText>
        )}
        {directorySelected && (
          <Button
            style={{ width: 160, marginTop: 16, gridArea: "start" }}
            type={theme === "dark" ? "primary" : "default"}
            onClick={startIndxing}
            disabled={indexingStarted}
          >
            <LumosText>Start</LumosText>
          </Button>
        )}
      </SelectionControl>
      {indexingStarted && (
        <Progress>
          <LumosTitle
            level={4}
            style={{ marginBottom: 32, textAlign: "center" }}
          >
            Processing...
          </LumosTitle>
          <LumosSpin size={"large"} />
          <LumosText
            type="secondary"
            style={{ width: 600, textAlign: "center" }}
          >
            {currentTip}
          </LumosText>
        </Progress>
      )}
      {finished && (
        <Finish>
          <LumosTitle
            level={4}
            style={{ marginBottom: 32, textAlign: "center" }}
          >
            Finished
          </LumosTitle>
          <IoMdCheckmark style={{ height: 30, width: 30 }} />
          <LumosText
            type="secondary"
            style={{ width: 600, textAlign: "center" }}
          >
            {recentSessionId}
          </LumosText>
        </Finish>
      )}
    </Container>
  );
};
