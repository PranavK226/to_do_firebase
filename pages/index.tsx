import { db, auth } from "../firebase_setup"
import React, { useState, useEffect } from "react";
import { ITodo } from "../types"
import LoginPage from "../components/LoginPage/LoginPage";
import TodoPage from '../components/TodoPage/TodoPage';

export default function Home() {
  const [todos, updateTodos] = useState([]);
  const [userExists, changeUserExists] = useState<boolean>(false);
  const [loading, changeLoading] = useState<boolean>(false);
  const [lastId, changeLast] = useState<number>(0);
  const [groups, changeGroups] = useState(["Personal"]);
  const [currentGroup, changeCurrentGroup] = useState<string>("Personal");
  useEffect(() => { loadData() }, [userExists])

  const loadData = () => {
    if (userExists) {
      if (currentGroup == "Personal") {
        db.ref(`${auth.currentUser?.uid}/Tasks/`).on("value", snapshot => {
          let allTodos: any = [];
          snapshot.forEach(snap => {
            var data: any = snap.val()
            var newTodo: ITodo = {
              id: data.id,
              description: data.description,
              isDone: data.isDone
            }
            allTodos.push(newTodo)
          })
          updateTodos(allTodos);
        })
      }
      else {
        db.ref(`${currentGroup}/Tasks/`).on("value", snapshot => {
          let allTodos: any = [];
          snapshot.forEach(snap => {
            var data: any = snap.val()
            var newTodo: ITodo = {
              id: data.id,
              description: data.description,
              isDone: data.isDone
            }
            allTodos.push(newTodo)
          })
          updateTodos(allTodos);
        })
      }
      try {
        db.ref(`${auth.currentUser?.uid}/Groups/`).once("value", snapshot => {
          let allGroups: any = ["Personal"]
          for (let i = 0; i < snapshot.val().length; i++) {
            allGroups.push(snapshot.val()[i]);
          }
          changeGroups(allGroups);
          console.log(groups);
        })
      }
      catch (error) {
        console.log(error);
      }
    }
  };

  if (userExists) {
    return (
      <TodoPage groups={groups} todos={todos} lastId={lastId} changeGroups={changeGroups} changeLast={changeLast} changeLoading={changeLoading} changeUserExists={changeUserExists} />
    )
  }
  else if (loading) {
    <div>Loading...</div>
  }
  else {
    return (
      <LoginPage changeLast={changeLast} changeLoading={changeLoading} changeUserExists={changeUserExists} />
    )
  }
}