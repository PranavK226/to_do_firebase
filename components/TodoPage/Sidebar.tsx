import React from "react";
import { useState } from "react";
import { auth, db } from "../../firebase_setup";
import { Form, Button, DropdownButton, Dropdown } from "react-bootstrap"

type Props = {
    groups: string[];
    signOut: () => void;
    changeCurrentGroup: (value: React.SetStateAction<string>) => void;
    allGroups: string[];
    changeAllGroups: (value: React.SetStateAction<string[]>) => void;
    changeGroups: (value: React.SetStateAction<string[]>) => void;
}

const Sidebar: React.FC<Props> = ({ groups, signOut, allGroups, changeAllGroups, changeGroups, changeCurrentGroup }) => {
    const [closed, changeClosed] = useState(false);

    const [newGroup, setNewGroup] = React.useState<string>('');
    const groupsNonsense = (group: string) => {
        changeCurrentGroup(group);
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newGroup) return;
        for (let i = 0; i < allGroups.length; i++) {
            if (newGroup == allGroups[i]) {
                setNewGroup('');
                return;
            }
        }
        db.ref(`${newGroup}/`).update({ LastId: 2 })
        db.ref(`${newGroup}/Tasks/`).update({ 1: { id: 1, description: "Say Hello to Your New Group", isDone: false } });
        let Groups = groups;
        Groups.push(newGroup);
        changeGroups(Groups);
        db.ref(`${auth.currentUser?.uid}/Groups/`).set(Groups);
        changeCurrentGroup(newGroup);
        let all = allGroups;
        all.push(newGroup);
        changeAllGroups(Groups);
        db.ref("All Groups").set(all);
        setNewGroup("");
    }

    const inGroups = (group: string) => {
        for (let i = 0; i < groups.length; i++) {
            if (group == groups[i]) return true;
        }
        return false;
    }

    const joinGroup = (group: string) => {
        if (!(inGroups(group))) {
            db.ref(`${group}/Requests/${auth.currentUser?.uid}`).set({ id: auth.currentUser?.uid, email: auth.currentUser?.email })
        }
    }

    if (!closed) {
        return (
            <div className="col-3 bg-dark absolute mx-1">
                <div className="primary">
                    <button onClick={() => changeClosed(!closed)}>
                        <svg width="45" height="35" viewBox="0 0 45 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.17188 33.7656H43.8281M1.17188 17.5156H43.8281M1.17188 1.26562H43.8281" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                    {auth.currentUser?.email}
                </div>
                <h2 className="primary">
                    Personal
                </h2>
                <a className="light" onClick={() => changeCurrentGroup("Personal")}>
                    Todos <br />
                </a>
                <a className="light" onClick={() => console.log("nothing here")}>
                    Account <br />
                </a>
                <a className="light" onClick={() => signOut()}>
                    Sign Out <br />
                </a>
                <h2 className="primary">
                    Groups
                </h2>
                {groups.map((group, index) => (
                    <a key={index} className="light" onClick={() => changeCurrentGroup(group)}>
                        {group} <br />
                    </a>
                ))}
                <Form onSubmit={handleSubmit}>
                    <Form.Group>
                        <Form.Label>
                            <b>Add Group</b>
                        </Form.Label>
                        <Form.Control type="text" className="input" value={newGroup} onChange={(e) => setNewGroup(e.target.value)} placeholder="Add new group" />
                    </Form.Group>
                    <Button className="secondary my-3" type="submit">
                        Submit
                    </Button>
                </Form>
                <DropdownButton className="my-3" id="dropdown-button-basic" title="Join a Group">
                    {allGroups.map((group, index) => (
                        <Dropdown.Item onClick={() => joinGroup(group)} key={index}>{(inGroups(group)) ? "Already Joined" : group}</Dropdown.Item>
                    ))}
                </DropdownButton>
            </div>
        )
    }
    else {
        return (
            <div className="col-1 bg-dark absolute">
                <button onClick={() => changeClosed(!closed)}>
                    <svg width="45" height="35" viewBox="0 0 45 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.17188 33.7656H43.8281M1.17188 17.5156H43.8281M1.17188 1.26562H43.8281" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </button>
            </div>
        )
    }

}

export default Sidebar;