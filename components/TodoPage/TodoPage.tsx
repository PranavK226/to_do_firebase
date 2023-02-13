import Head from "next/head";
import React, { useState } from "react";
import { auth, db } from "../../firebase_setup";
import FormTodo from "./FormTodo";
import Todo from "./Todo";
import { GroupRequest, ITodo } from "../../types"
import { Card, Dropdown, DropdownButton } from "react-bootstrap";
import Sidebar from "./Sidebar";
import Request from "./Request";
import { Icon } from "@iconify/react";

type Props = {
    currentGroup: string;
    groups: string[];
    groupRequests: GroupRequest[];
    todos: ITodo[];
    sortedTodos: ITodo[];
    lastId: number;
    allGroups: string[];
    changeSorted: React.Dispatch<React.SetStateAction<ITodo[]>>;
    changeGroupRequests: (value: React.SetStateAction<GroupRequest[]>) => void;
    changeCurrentGroup: (value: React.SetStateAction<string>) => void;
    changeGroups: (value: React.SetStateAction<string[]>) => void;
    changeAllGroups: (value: React.SetStateAction<string[]>) => void;
    changeLast: (value: React.SetStateAction<number>) => void;
    changeUserExists: (value: React.SetStateAction<boolean>) => void;
    changeLoading: (value: React.SetStateAction<boolean>) => void
}

const TodoPage: React.FC<Props> = ({ currentGroup, groups, groupRequests, allGroups, todos, sortedTodos, lastId, changeSorted, changeGroupRequests, changeCurrentGroup, changeGroups, changeAllGroups, changeLast, changeUserExists, changeLoading }) => {

    const [sort, changeSort] = useState<string[]>(["Original", "Ascending"]);

    const addTodo = (text: string, date: Date | undefined) => {
        db.ref(`${currentGroup == "Personal" ? auth.currentUser?.uid : currentGroup}/Tasks/${lastId + 1}/`).set({ id: lastId + 1, description: text, isDone: false, addedBy: auth.currentUser?.email })
        if (date != undefined) {
            db.ref(`${currentGroup == "Personal" ? auth.currentUser?.uid : currentGroup}/Tasks/${lastId + 1}/`).update({ date: date })
        }
        db.ref(`${currentGroup == "Personal" ? auth.currentUser?.uid : currentGroup}/`).update({ LastId: lastId + 1 })
        changeLast(lastId + 1)
    };

    const markTodo = (id: number, done: boolean) => {
        db.ref(`${currentGroup == "Personal" ? auth.currentUser?.uid : currentGroup}/Tasks/${id}/`).update({ isDone: done });
    };

    const removeTodo = (id: number) => {
        db.ref(`${currentGroup == "Personal" ? auth.currentUser?.uid : currentGroup}/Tasks/${id}/`).remove();
    };

    const editTodo = (todo: ITodo) => {
        db.ref(`${currentGroup == "Personal" ? auth.currentUser?.uid : currentGroup}/Tasks/${todo.id}/`).update({ description: todo.description, isDone: todo.isDone, addedBy: todo.addedBy })
        if (todo.date != undefined) {
            db.ref(`${currentGroup == "Personal" ? auth.currentUser?.uid : currentGroup}/Tasks/${todo.id}/`).update({ date: todo.date })
        }
    }

    const signOut = async () => {
        changeLoading(true);
        try {
            const res = await auth.signOut();
            changeUserExists(false);
            changeCurrentGroup("Personal");
            changeGroups(["Personal"])
        }
        catch (error) {
            console.log(error);
        }
        changeLoading(false);
    }

    const acceptRequest = (request: GroupRequest) => {
        db.ref(`${request.id}/Groups/`).once("value", snapshot => {
            let Groups: any = [];
            let ingroup: boolean = false;
            for (let i = 0; i < snapshot.val().length; i++) {
                Groups.push(snapshot.val()[i]);
                if (snapshot.val()[i] == currentGroup) {
                    ingroup = true;
                }
            }
            Groups.push(currentGroup)
            if (!ingroup) {
                db.ref(`${request.id}/Groups/`).update(Groups);
            }
        });
        deleteRequest(request);
    }

    const deleteRequest = (request: GroupRequest) => {
        db.ref(`${currentGroup}/Requests/${request.id}/`).remove();
        db.ref(`${currentGroup}/Requests/`).once("value", snapshot => {
            let allRequests: any = [];
            snapshot.forEach(snap => {
                var data: any = snap.val();
                var newRequest: GroupRequest = {
                    id: data.id,
                    email: data.email
                }
                allRequests.push(newRequest);
            })
            changeGroupRequests(allRequests);
        })
    }

    const sortStuff = (sortType: string, e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        var direction = sort[1];
        if (sortType == sort[0]) {
            if (sort[1] == "Descending") {
                direction = "Ascending";
            }
            else {
                direction = "Descending";
            }
        }

        var s: ITodo[] = todos.slice();
        if (sortType == "Original" && direction == "Ascending") {
            s = s.reverse();
        }
        if (sortType == "Description" && direction == "Ascending") {
            s = s.sort((a: ITodo, b: ITodo) => {
                if (a.description.toLowerCase() > b.description.toLowerCase()) {
                    return 1;
                }
                if (b.description.toLowerCase() > a.description.toLowerCase()) {
                    return -1;
                }
                return 0;
            })
        }
        else if (sortType == "Description" && direction == "Descending") {
            s = s.sort((a: ITodo, b: ITodo) => {
                if (a.description.toLowerCase() > b.description.toLowerCase()) {
                    return -1;
                }
                if (b.description.toLowerCase() > a.description.toLowerCase()) {
                    return 1;
                }
                return 0;
            })
        }
        else if (sortType == "Author" && direction == "Ascending") {
            s = s.sort((a: ITodo, b: ITodo) => {
                if (a.addedBy.toLowerCase() > b.addedBy.toLowerCase()) {
                    return 1;
                }
                if (b.addedBy.toLowerCase() > a.addedBy.toLowerCase()) {
                    return -1;
                }
                return 0;
            })
        }
        else if (sortType == "Author" && direction == "Descending") {
            s = s.sort((a: ITodo, b: ITodo) => {
                if (a.addedBy.toLowerCase() > b.addedBy.toLowerCase()) {
                    return -1;
                }
                if (b.addedBy.toLowerCase() > a.addedBy.toLowerCase()) {
                    return 1;
                }
                return 0;
            })
        }
        else if (sortType == "Date" && direction == "Ascending") {
            s = s.sort((a: ITodo, b: ITodo) => {
                if (b.date == null || a.date == null) {
                    return -1;
                }
                if (a.date > b.date) {
                    return 1;
                }
                if (b.date > a.date) {
                    return -1;
                }
                return 0;
            })
        }
        else if (sortType == "Date" && direction == "Ascending") {
            s = s.sort((a: ITodo, b: ITodo) => {
                if (b.date == null || a.date == null) {
                    return -1;
                }
                if (a.date > b.date) {
                    return -1;
                }
                if (b.date > a.date) {
                    return 1;
                }
                return 0;
            })
        }

        changeSorted(s);
        changeSort([sortType, direction]);
    }

    return (
        <div>
            <Head>
                <title>To-do App</title>
            </Head>
            <main>
                <div className="grid">
                    <div className="row">
                        <Sidebar groups={groups} allGroups={allGroups} signOut={signOut} changeAllGroups={changeAllGroups} changeGroups={changeGroups} changeCurrentGroup={changeCurrentGroup}></Sidebar>
                        <div className="col-lg-8 col-sm-10 px-4">
                            <h1 className="primary">
                                {currentGroup}
                            </h1>
                            {currentGroup != "Personal" ? <div>
                                <h2 className="secondary">
                                    Join Requests
                                </h2>
                                {groupRequests.map((request, index) => (
                                    <Card className="bgdark-alt border-0 my-2" key={index}>
                                        <Card.Body>
                                            <Request key={index} acceptRequest={acceptRequest} deleteRequest={deleteRequest} request={request} />
                                        </Card.Body>
                                    </Card>))}
                            </div> : ""}
                            <h2 className="secondary my-4">
                                Add a Todo
                            </h2>
                            <FormTodo addTodo={addTodo} />
                            <h2 className="secondary my-4">
                                Todos
                            </h2>
                            <DropdownButton variant="secondary" id="dropdown-basic-button" title="Sort by">
                                {["Original", "Date", "Description", "AddedBy"].map((sortType, index) => (
                                    <Dropdown.Item key={index}><a className="dropdown-item" onClick={(e) => sortStuff(sortType, e)}>
                                        {sortType == sort[0] ?
                                            <div>
                                                {sortType}
                                                <Icon className="m-2" icon={sort[1] == "Ascending" ? "ic:outline-keyboard-double-arrow-up" : "ic:outline-keyboard-double-arrow-down"}></Icon>
                                            </div> : sortType}
                                    </a></Dropdown.Item>
                                ))}
                            </DropdownButton>
                            {sortedTodos.map((todo, index) => (
                                <Card className="bgdark-alt border-0 my-2" key={index}>
                                    <Card.Body>
                                        <Todo todo={todo} markTodo={markTodo} removeTodo={removeTodo} editTodo={editTodo} />
                                    </Card.Body>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default TodoPage;