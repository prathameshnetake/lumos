import React, { useCallback, useEffect, useContext, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  update,
  updateCurrentTip,
  updateIndexingStarted,
  updateFinished,
  updateRecentSessionId,
  updateProgress,
  updateSessionName,
} from "../../reducers/createEncodings";
import { VscFolderOpened, VscClose, VscKey } from "react-icons/vsc";
import { Button } from "../common/Button";
import { ProgressLoader } from "../common/ProgressLoader";
import colors from "tailwindcss/colors";

export const CreateEncodings = () => {
  const ipcRenderer = (window as any).electron.ipcRenderer;
  const dispatch = useAppDispatch();
  const {
    direcorySource,
    currentTip,
    indexingStarted,
    finished,
    recentSessionId,
    progress,
    sessionName,
  } = useAppSelector((state) => state.createEncodings);
  const directorySelected = Boolean(direcorySource);

  const open = () => {
    ipcRenderer.send("test");
  };

  const reset = () => {
    dispatch(update(""));
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

  const memoEmbeddingsProgressUpdate = useCallback(
    (_: unknown, response: number) => {
      dispatch(updateProgress(response));
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
    ipcRenderer.on("embeddings-progress-update", memoEmbeddingsProgressUpdate);

    return () => {
      ipcRenderer.off("directory-selected", memoDirecortySelected);
      ipcRenderer.off("embeddings-tip-update", memoEmbeddingsTipUpdate);
      ipcRenderer.off("embeddings-finished", memoEmbeddingsFinished);
      ipcRenderer.on(
        "embeddings-progress-update",
        memoEmbeddingsProgressUpdate
      );
    };
  }, [dispatch, memoDirecortySelected]);

  const startIndxing = () => {
    dispatch(updateCurrentTip("starting indexing ..."));
    dispatch(updateProgress(0));
    dispatch(updateIndexingStarted(true));
    ipcRenderer.send("start-images-indexing", { direcorySource, sessionName });
  };

  return (
    <div className="bg-common flex-1 flex items-center justify-center">
      <div className="w-2/4 shadow-xl rounded-lg p-4 h-72">
        {!directorySelected ? (
          <div className="flex items-center justify-center w-full h-full flex-col">
            <p className="font-semibold text-2xl my-2">
              Drag and Drop folder here
            </p>
            <p>Or</p>
            <Button text="Browse folder" onClick={open} className="my-2" />
          </div>
        ) : null}
        {directorySelected && !indexingStarted ? (
          <div className="flex w-full h-full flex-col">
            <div className="flex justify-center items-center relative">
              <VscClose
                className="absolute right-0 top-0 cursor-pointer text-gray-400"
                onClick={reset}
              />
              <VscFolderOpened className="text-6xl text-blue-500 mr-4" />
              <div>
                <p className="font-semibold text-sm w-80 truncate">
                  {direcorySource}
                </p>
                <p className="text-gray-400 font-thin text-xs">123456 files</p>
              </div>
            </div>
            <hr className="m-auto my-4 w-4/6 text-center" />
            <div>
              <div className="flex items-center ">
                <VscKey className="mx-4 text-gray-600" />
                <input
                  type="text"
                  placeholder="session name"
                  autoFocus
                  value={sessionName}
                  className="flex-1 outline-none px-2 py-2 text-sm text-gray-600 bg-transparent"
                  onChange={(e) => dispatch(updateSessionName(e.target.value))}
                />
              </div>
            </div>
            <div className="flex m-4 justify-center">
              <button
                className="rounded bg-blue-500 text-gray-50 px-4 py-2 outline-none cursor-pointer hover:bg-blue-400"
                onClick={startIndxing}
              >
                Start Analyzing
              </button>
            </div>
          </div>
        ) : null}
        {directorySelected && indexingStarted ? (
          <div className="flex w-full h-full flex-col items-center">
            <ProgressLoader
              width={200}
              height={200}
              borderWidth={10}
              progress={progress}
              borderColor={colors.blue[500]}
            />
            <p className="text-center font-semibold  mt-2 text-sm overflow-ellipsis w-9/12 truncate">
              {currentTip}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};
