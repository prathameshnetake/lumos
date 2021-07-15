import React, { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  updateSessions,
  updateSelectedFile,
  updateCurrentFaces,
  updateCurrectMatches,
  updateFetchingMatches,
  updateFetchingFaces,
} from "../../reducers/search";
import { OpenDialogReturnValue } from "electron/main";
import { AiOutlineDelete, AiOutlineSelect } from "react-icons/ai";
import { BsPersonBoundingBox } from "react-icons/bs";
import { BiFileFind } from "react-icons/bi";
import { SessionBlob } from "../../../electron/DB/session";
import { Button } from "../common/Button";
import { RadioGroup } from "@headlessui/react";
import peopleSearch from "../../assets/people_search.svg";
import searchIcon from "../../assets/search.svg";
const ipcRenderer = (window as any).electron.ipcRenderer;

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
    fetchingFaces,
  } = useAppSelector((state) => state.search);

  const fileSelected = useCallback((_, res: OpenDialogReturnValue) => {
    if (!res.canceled) {
      dispatch(updateCurrectMatches([]));
      dispatch(updateCurrentFaces([]));
      dispatch(updateSelectedFile(res.filePaths[0]));
    }
  }, []);

  const getFacesCallback = useCallback((_, faces: string[]) => {
    dispatch(updateFetchingFaces(false));
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
    dispatch(updateFetchingFaces(true));
    ipcRenderer.send("get-faces", selectedFile);
  };

  const faceSelect = () => {};

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

  console.log(currentMatches);

  return (
    <div className="bg-gray-50 dark:bg-gray-700 flex-1 px-4 py-8 select-none flex flex-col dark:text-gray-50">
      {/* QUERY AREA */}
      <div className="flex h-60 items-center justify-center">
        <div className="flex-1  flex flex-col items-center">
          <div
            className="text-3xl text-blue-500 cursor-pointer mb-2"
            onClick={selectFile}
          >
            <BsPersonBoundingBox />
          </div>
          <p>Select/Drag image</p>
          {selectedFile ? (
            <div className="flex items-center justify-center">
              <img
                src={selectedFile}
                alt=""
                className="rounded h-14 shadow-lg m-4"
              />
              <Button
                text={"Extract Faces"}
                onClick={getFaces}
                disabled={fetchingFaces}
                inProgress={fetchingFaces}
              />
            </div>
          ) : null}
        </div>
        <div className="flex-1 flex items-center flex-col justify-center">
          {!currentFaces.length && (
            <React.Fragment>
              <img
                src={peopleSearch}
                alt=""
                className="h-32 justify-self-center"
              />
            </React.Fragment>
          )}
          {currentFaces.length ? (
            <React.Fragment>
              <div
                className="text-3xl text-blue-500 cursor-pointer mb-2"
                onClick={selectFile}
              ></div>
              <p className="mb-2">Face results from Image</p>
              <RadioGroup
                value={queryFace}
                onChange={setQueryFace}
                className="flex space-x-4 justify-center"
              >
                <RadioGroup.Label className="sr-only">
                  Select Face
                </RadioGroup.Label>
                {currentFaces.map((face) => {
                  return (
                    <RadioGroup.Option
                      value={face}
                      className="cursor-pointer"
                      key={face}
                    >
                      {({ checked }) => (
                        <img
                          src={face}
                          alt=""
                          className="rounded-md h-10 shadow-lg"
                        />
                      )}
                    </RadioGroup.Option>
                  );
                })}
              </RadioGroup>
              <div className="flex items-center justify-center">
                <img
                  src={queryFace}
                  alt=""
                  className="rounded-lg h-24 shadow-2xl m-6 "
                />
                <Button
                  text={"Find Matches"}
                  onClick={findMatch}
                  disabled={fetchingMatches}
                  inProgress={fetchingMatches}
                />
              </div>
            </React.Fragment>
          ) : null}
        </div>
      </div>

      {/* RESULT */}
      <React.Fragment>
        {!currentMatches.length && (
          <div className=" flex-1 flex items-center justify-center flex-col">
            <img src={searchIcon} className="h-40 w-40" />
            <p className="font-semibold text-2xl m-4">No Matches Yet!</p>
          </div>
        )}
        <div className="flex flex-wrap overflow-y-auto">
          {currentMatches.map((match) => (
            <div
              className="h-32 w-28 mr-4 flex items-center justify-center flex-col transform hover:scale-105 transition-transform cursor-pointer"
              key={match.annoyItemIndex}
            >
              <img
                src={match.filePath}
                alt=""
                className="h-24 rounded-sm shadow-sm"
              />
              <p className="w-full h-4 text-xs truncate mt-2 font-semibold">
                {match.filePath}
              </p>
            </div>
          ))}
        </div>
      </React.Fragment>
    </div>
  );
};
