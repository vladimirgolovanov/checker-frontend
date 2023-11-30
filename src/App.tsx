import { useState, useEffect } from 'react'
//, useReducer
import {Navbar, Container, Button, Row, Col, Nav, Badge, Form} from 'react-bootstrap'
import axios from "axios";

interface UserData {
    user_id: string;
    email: string;
    projects: object;
}

/*const formReducer = (state, event) => {
    return {
        ...state,
        [event.target.name]: event.target.value
    }
}*/

function App() {
    const [userId, setUserId] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [userProjects, setUserProjects] = useState<Array | null>(null);
    const [currentProject, setCurrentProject] = useState<Array | null>(null);
    //const [submitting, setSubmitting] = useState(false);
    //const [formData, setFormData] = useReducer(formReducer, {});

    // todo: enum
    const namespaceNames: {[index: number]: string} = {
        0: "Instagram username",
        5: "Tiktok username",
        6: "Snapchat username",
        1: ".com domain",
        2: ".ru domain",
        3: ".net domain",
        4: ".io domain",
        7: "npm username",
        8: "github username",
        9: "telegram channel",
        10: "telegram bot",
    };

    useEffect(() => {
        // Выполняем запрос к /api/user
        axios.get<UserData>('/api/user')
            .then(response => {
                const user_id = response.data.user_id;
                const email = response.data.email;
                const projects = response.data.projects;
                setUserId(user_id);
                setUserEmail(email);
                setUserProjects(projects);

                // Здесь можно вызвать нужные функции на основе полученного user_id
                if (user_id) {
                    //console.log(projects);
                    const currentProject = Object.keys(projects)[0];
                    axios.post('/api/load_project', {project_id: currentProject})
                        .then(response => {
                            //console.log(response.data[0]);
                            setCurrentProject(response.data[0]);
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
        window.location.href = '/api/google-oauth-redirect'; // Замените на нужный URL
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        //setSubmitting(true);
        console.log(event.target.elements);
        const tempPlayer = new FormData(event.target);
        console.log(tempPlayer);
        axios.post('/api', tempPlayer);

        /*setTimeout(() => {
            setSubmitting(false);
        }, 3000)*/
    };

/*    const handleChange = event => {
        setFormData({
            name: event.target.name,
            value: event.target.value,
        });
    }*/
    /*function submitForm(event): void {
        event.preventDefault();
        console.log(event.target.elements);
    }
*/
    return (
        <div>
            <Navbar className="bg-body-tertiary mb-3">
                <Container>
                    <Navbar.Brand>Aboo.ru - check free names for your project</Navbar.Brand>
                    <div id="userContainer">
                        { userId ? <div>Logged in as {userEmail}</div> : <Button variant="outline-primary" onClick={loginWithGoogle}>Sign in via Google</Button> }
                    </div>
                </Container>
            </Navbar>
            <Container>
                <form onSubmit={handleSubmit}>
                    <Row>
                        <Col xs="4">
                            <Form.Control
                                type="text"
                                name="name"
                                placeholder="name or username"
                                className="form-control-lg"

                            />{/*onChange={handleChange}*/}
                            <Button type="submit" variant={"primary"} className="form-control-lg">Submit</Button>
                            <div className="form-text">Type the desirable name to check if there are free usernames or domain names for it</div>
                        </Col>

                        <Col xs="8">
                            {Object.keys(namespaceNames).map(function (index: number) {
                                return <div key={index}>
                                    <label htmlFor="{`nametype-${index}`}">
                                        <input type="checkbox" name="{`namespace-${index}`}" id="{`nametype-${index}`}" value="{ index }" /> {namespaceNames[index]}</label>
                                </div>
                            })}
                        </Col>
                    </Row>
                </form>

                <Nav className="nav-tabs mb-3">
                    {userProjects && Object.keys(userProjects).map(function (projectKey) {
                        // todo: отметить выбранный классом active
                        return <a key={projectKey} className="nav-link active">{userProjects[projectKey]}</a>
                    })}
                </Nav>

                <ul className="list-group list-group-flush">
                    {currentProject && currentProject.names.map(function (item, index) {
                        return (
                            <li className="list-group-item" key={index}>
                                {item.name}
                                {item.namespaces.map(function (namespace, namespace_index) {
                                    // todo: text-bg-danger etc
                                    return (
                                        <span key={namespace_index}>
                                            {' '}
                                            <Badge bg={namespace.result ? "success" : "danger"}>
                                                {namespaceNames[namespace.namespace_id]}
                                            </Badge>
                                        </span>
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
