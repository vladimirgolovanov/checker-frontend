import React, { useState, useEffect } from 'react'

//, useReducer
import {Navbar, Container, Button, Row, Col, Nav, Form} from 'react-bootstrap'
import axios from "axios";
import NameBadge from "./Components/NameBadge.tsx";

interface UserData {
    user_id: string;
    email: string;
    projects: string[];
}

interface CurrenProject {
    projectName: string;
    names: ProjectNames[];
}

interface ProjectNames {
    name: string;
    namespaces: Namespace[];
}

interface Namespace {
    namespace_id: number;
    result: number;
}

const baseUrl = import.meta.env.BASE_API_URL || '/';

function App() {
    const [userId, setUserId] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    /*const [userProjects, setUserProjects] = useState<{
        name: string,
        names: []
    } | null>(null);*/
    const [currentProject, setCurrentProject] = useState<CurrenProject>({
        projectName: "My project",
        names: [
            /*{
                name: "example",
                namespaces: [
                    {
                        namespace_id: 1,
                        result: 1,
                    },
                    {
                        namespace_id: 2,
                        result: 0,
                    }
                ]
            },
            {
                name: "other",
                namespaces: [
                    {
                        namespace_id: 1,
                        result: 0,
                    },
                    {
                        namespace_id: 2,
                        result: 0,
                    }
                ]
            }*/
        ]
    });

    // todo: enum
    const namespaceNames: {[index: number]: string} = {
        0: "Instagram",
        5: "Tiktok",
        6: "Snapchat",
        1: ".com domain",
        2: ".ru domain",
        3: ".net domain",
        4: ".io domain",
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
    const domainIndexes: number[] = [1, 2, 3, 4];

    useEffect(() => {
        axios.get<UserData>(baseUrl + 'api/user')
            .then(response => {
                const user_id = response.data.user_id;
                const email = response.data.email;
                const projects = response.data.projects;
                setUserId(user_id);
                setUserEmail(email);
                //setUserProjects(projects);

                let projectId;
                if (user_id) {
                    projectId = Object.keys(projects)[0];
                } else {
                    projectId = localStorage.getItem('sessionId');
                }
                if (projectId) {
                    axios.post(baseUrl + 'api/load_project', {project_id: projectId})
                    .then(response => {
                        setCurrentProject({
                            projectName: "My project",
                            names: response.data
                        });
                    })
                    .catch(error => {
                        console.error("Error fetching project names:", error);
                    });
                }
            })
            .catch(error => {
                console.error("Error fetching user data:", error);
            });
    }, []);

    function loginWithGoogle() {
        window.location.href = baseUrl + 'api/google-oauth-redirect';
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const target = event.currentTarget;
        const formData = new FormData(target);

        let userUuid = localStorage.getItem('sessionId');
        if (!userUuid) {
            userUuid = crypto.randomUUID();
            localStorage.setItem('sessionId', userUuid);
        }
        console.log(userUuid);
        formData.set('user_prefix', userUuid);

        //setSubmitting(true);
        axios.post(baseUrl + 'api/check_name', formData)
            .then(response => {
                if (response.status !== 200) {
                    alert('smth goes wrong');
                }
                //alert(response.data.result);
                if (response.data.success === true && event.target !== undefined) {
                    console.log(response.data.result);
                    //const checkedName = target.checkedName.value;
                    //const checkedName = target.elements.name.value;
                    setCurrentProject({
                        projectName: "My project",
                        names: response.data.result
                    });
                } else {
                    console.log('err');
                }
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

                <ul className="list-group list-group-flush">
                    {currentProject && Object.keys(currentProject.names).reverse().map(function (key: any) {
                        let nameItem = currentProject.names[key];
                        return (
                            <li key={key}>{nameItem.name}<br />
                                {Object.keys(nameItem.namespaces).map(function (namespaceKey: any) {
                                    let namespace = nameItem.namespaces[namespaceKey];
                                    return (
                                        <span key={namespaceKey}><NameBadge
                                            name={namespaceNames[namespace.namespace_id]}
                                            result={namespace.result} /> </span>
                                    )
                                })}
                            </li>
                        )
                    })}
                </ul>
            </Container>
        </div>
    )
}

export default App
