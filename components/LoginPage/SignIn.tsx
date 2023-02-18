import { Icon } from "@iconify/react";
import React from "react";
import { Button, Form } from "react-bootstrap";
import { signInWithGoogle } from "../../firebase_setup";

type Props = {
    changePage: React.Dispatch<React.SetStateAction<string>>;
    signIn: (email: string, password: string) => void;
}

const SignIn: React.FC<Props> = ({ changePage, signIn }) => {
    const [email, setEmail] = React.useState<string>("");
    const [password, setPassword] = React.useState<string>("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email) return;
        if (!password) return;
        signIn(email, password);
        setEmail("");
        setPassword("");
    }

    return (
        <div className="grad">
            <div className="bgdark sign">
                <Form onSubmit={handleSubmit}>
                    <Form.Group>
                        <Form.Label>
                            <h2 className="primary">Sign In<br /></h2>
                        </Form.Label>
                        <Form.Control
                            required={true}
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email"
                        />
                        <Form.Control
                            required={true}
                            type="password"
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                        />
                    </Form.Group>
                    <Button className="button-primary bgprimary my-3" type="submit">
                        Submit
                    </Button>
                </Form>
                <hr />
                <h3 className="light">
                    Other Sign-in Methods
                </h3>
                <div className="row">
                    <div className="col">
                        <Icon icon="logos:google-icon" onClick={signInWithGoogle}/>
                    </div>
                </div>
                <hr />
                <div className="row">
                    <div className="col">
                        <div className="light">
                            Forgot Password?
                        </div>
                        <Button className="button-primary" onClick={() => changePage("reset")}>
                            Reset
                        </Button>
                    </div>
                    <div className="col">
                        <div className="light">
                            Need an Account?
                        </div>
                        <Button className="button-primary bgprimary" onClick={() => changePage("signup")}>Sign Up</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SignIn;
