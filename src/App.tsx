import React, { useState, useEffect } from 'react'

//, useReducer
import {Navbar, Container, Button, Row, Col, Form} from 'react-bootstrap'
import axios from "axios";
import NameBadge from "./Components/NameBadge.tsx";

interface UserData {
    user_id: string;
    email: string;
    projects: string[];
}

interface CheckNameResponse {
    results: Namespace[];
    validation_errors: ValidationError[];
}

interface Namespace {
    namespace_id: number;
    result: number;
}

interface ValidationError {
    namespace: number;
    errors: string;
}

const baseUrl = import.meta.env.BASE_API_URL || '/';

function App() {
    const [userId, setUserId] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [checkedName, setCheckedName] = useState<string | null>(null);
    const [results, setResults] = useState<Namespace[]>([]);
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

    // todo: enum
    const namespaceNames: {[index: number]: string} = {
        0: "Instagram",
        5: "Tiktok",
        6: "Snapchat",
        1: "domain",
        7: "npm username",
        8: "GitHub",
        9: "Telegram channel",
        10: "Telegram bot",
        11: "Etsy shop",
        12: "Pinterest",
    };

    const socialNetworkIndexes: number[] = [5, 6, 9, 10, 12, 0];
    const shopsIndexes: number[] = [11];
    const devIndexes: number[] = [7, 8];
    const domainIndexes: number[] = [1];

    // useEffect(() => {
    //     axios.get<UserData>(baseUrl + 'api/user')
    //         .then(response => {
    //             const user_id = response.data.user_id;
    //             const email = response.data.email;
    //             const projects = response.data.projects;
    //             setUserId(user_id);
    //             setUserEmail(email);
    //             //setUserProjects(projects);
    //
    //             let projectId;
    //             if (user_id) {
    //                 projectId = Object.keys(projects)[0];
    //             } else {
    //                 projectId = localStorage.getItem('sessionId');
    //             }
    //             if (projectId) {
    //                 axios.post(baseUrl + 'api/load_project', {project_id: projectId})
    //                 .then(response => {
    //                     setCurrentProject({
    //                         projectName: "My project",
    //                         names: response.data
    //                     });
    //                 })
    //                 .catch(error => {
    //                     console.error("Error fetching project names:", error);
    //                 });
    //             }
    //         })
    //         .catch(error => {
    //             console.error("Error fetching user data:", error);
    //         });
    // }, []);

    function loginWithGoogle() {
        // window.location.href = baseUrl + 'api/google-oauth-redirect';
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const target = event.currentTarget;
        const formData = new FormData(target);

        const name = formData.get('name') as string;
        const namespaces: {id: number}[] = [];
        for (const key of formData.keys()) {
            const match = key.match(/^namespaces\[(\d+)\]$/);
            if (match) {
                namespaces.push({id: parseInt(match[1])});
            }
        }
        const payload = {name, namespaces};

        axios.post<CheckNameResponse>(baseUrl + 'api/check_name', payload)
            .then(response => {
                setCheckedName(name);
                setResults(response.data.results ?? []);
                setValidationErrors(response.data.validation_errors ?? []);
            })
            .catch(function (error) {
                alert(error)
            });
    };

    return (
        <div>
            <Navbar className="bg-body-tertiary mb-3">
                <Container>
                    <Navbar.Brand>{/*Aboo.ru - */}Check free names for your project</Navbar.Brand>
                    <div id="userContainer" style={{display: "none"}}>
                        { userId ? <div>Logged in as {userEmail}</div> : <Button variant="outline-primary" onClick={loginWithGoogle}>Sign in via Google</Button> }
                    </div>
                </Container>
            </Navbar>
            <Container>
                <form onSubmit={handleSubmit}>
                    <Row>
                        <Col md="4" xs="6">
                            <Form.Control
                                type="text"
                                name="name"
                                placeholder="name or username"
                                id="checkedName"
                                className="form-control-lg"
                            />{/*onChange={handleChange}*/}
                            <Button type="submit" variant={"primary"} className="form-control-lg">Submit</Button>
                            <div className="form-text">Type the desirable name to check if there are free usernames or domain names for it</div>
                        </Col>
                        <Col md="8" xs="6">
                            <Row>
                                <Col md="3" xs="12">
                                    <b>Social</b>
                                    {socialNetworkIndexes.map(function (value: number, i: number) {
                                        return <div key={i}>
                                            <label htmlFor={'nametype-' + value.toString()}>
                                                <input
                                                    type="checkbox"
                                                    name={`namespaces[${value}]`} id={'nametype-' + value.toString()}
                                                    {... (value === 0 ? {disabled: true} : {})} // temporary disable Instagram
                                                /> {namespaceNames[value]}</label>
                                        </div>
                                    })}
                                </Col>
                                <Col md="3" xs="12">
                                    <b>Shops</b>
                                    {shopsIndexes.map(function (value: number, i: number) {
                                        return <div key={i}>
                                            <label htmlFor={'nametype-' + value.toString()}>
                                                <input
                                                    type="checkbox"
                                                    name={`namespaces[${value}]`} id={'nametype-' + value.toString()}
                                                /> {namespaceNames[value]}</label>
                                        </div>
                                    })}
                                </Col>
                                <Col md="3" xs="12">
                                    <b>Dev</b>
                                    {devIndexes.map(function (value: number, i: number) {
                                        return <div key={i}>
                                            <label htmlFor={'nametype-' + value.toString()}>
                                                <input
                                                    type="checkbox"
                                                    name={`namespaces[${value}]`} id={'nametype-' + value.toString()}
                                                /> {namespaceNames[value]}</label>
                                        </div>
                                    })}
                                </Col>
                                <Col md="3" xs="12">
                                    <b>Domains</b>
                                    {domainIndexes.map(function (value: number, i: number) {
                                        return <div key={i}>
                                            <label htmlFor={'nametype-' + value.toString()}>
                                                <input
                                                    type="checkbox"
                                                    name={`namespaces[${value}]`} id={'nametype-' + value.toString()}
                                                /> {namespaceNames[value]}</label>
                                        </div>
                                    })}
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </form>

                {/* <Nav className="nav-tabs mb-3"> */}
                    {/*{userProjects && Object.keys(userProjects).map(function (projectKey) {
                        // todo: отметить выбранный классом active
                        return <a key={projectKey} className="nav-link active">{userProjects[projectKey]}</a>
                    })}*/}
                {/* </Nav> */}

                {checkedName && (
                    <ul className="list-group list-group-flush">
                        <li className="list-group-item">
                            <strong>{checkedName}</strong><br />
                            {results.map((ns, i) => (
                                <span key={i}><NameBadge
                                    name={namespaceNames[ns.namespace_id]}
                                    result={ns.result} /> </span>
                            ))}
                            {validationErrors.map((ve, i) => (
                                <span key={i} className="text-danger ms-1">
                                    {namespaceNames[ve.namespace]}: {ve.errors}
                                </span>
                            ))}
                        </li>
                    </ul>
                )}
            </Container>
        </div>
    )
}

export default App
