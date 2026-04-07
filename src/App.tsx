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
    params?: string;
}

interface ValidationError {
    namespace: number;
    errors: string;
}

interface HistoryEntry {
    name: string;
    results: Namespace[];
    validationErrors: ValidationError[];
}

const baseUrl = import.meta.env.BASE_API_URL || '/';

function App() {
    const [userId, setUserId] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>(() => {
        try { return JSON.parse(localStorage.getItem('history') ?? '[]'); } catch { return []; }
    });

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

    const socialNetworkIndexes: number[] = [5, 6, 9, 10, 12];
    // const shopsIndexes: number[] = [11];
    const devIndexes: number[] = [7, 8];

    const presetZones = ['com', 'ai'];
    const suggestedZones = ['.dev', '.crypto', '.eth', '.io', '.cc', '.shop', '.coach', '.xyz'];
    const [selectedZones, setSelectedZones] = useState<string[]>([]);
    const [addedZones, setAddedZones] = useState<string[]>(() => {
        try { return JSON.parse(localStorage.getItem('addedZones') ?? '[]'); } catch { return []; }
    });
    const [customZone, setCustomZone] = useState<string>('');
    const [zoneDropdownOpen, setZoneDropdownOpen] = useState(false);

    useEffect(() => { localStorage.setItem('history', JSON.stringify(history)); }, [history]);
    useEffect(() => { localStorage.setItem('addedZones', JSON.stringify(addedZones)); }, [addedZones]);

    const addCustomZone = () => {
        const zone = customZone.trim().replace(/^\./, '');
        if (!zone || addedZones.includes(zone) || presetZones.includes(zone)) return;
        setAddedZones(prev => [...prev, zone]);
        setSelectedZones(prev => [...prev, zone]);
        setCustomZone('');
        setZoneDropdownOpen(false);
    };

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

        const name = formData.get('checker_name') as string;
        const namespaces: ({id: number} | {id: number, params: {zones: string[]}})[] = [];
        for (const key of formData.keys()) {
            const match = key.match(/^namespaces\[(\d+)\]$/);
            if (match) {
                namespaces.push({id: parseInt(match[1])});
            }
        }

        const allZones = [...selectedZones];
        if (allZones.length > 0) {
            namespaces.push({id: 1, params: {zones: allZones}});
        }

        const payload = {name, namespaces};

        const pendingResults: Namespace[] = [];
        for (const key of formData.keys()) {
            const match = key.match(/^namespaces\[(\d+)\]$/);
            if (match) {
                pendingResults.push({namespace_id: parseInt(match[1]), result: 3});
            }
        }
        for (const zone of allZones) {
            pendingResults.push({namespace_id: 1, result: 3, params: zone});
        }

        setHistory(prev => [
            { name, results: pendingResults, validationErrors: [] },
            ...prev.filter(e => e.name !== name),
        ]);

        axios.post<CheckNameResponse>(baseUrl + 'api/check_name', payload)
            .then(response => {
                setHistory(prev => prev.map((e, i) =>
                    i === 0 && e.name === name
                        ? { name, results: response.data.results ?? [], validationErrors: response.data.validation_errors ?? [] }
                        : e
                ));
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
                <form onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === 'Enter' && (e.target as HTMLInputElement).type === 'checkbox') { e.preventDefault(); e.currentTarget.requestSubmit(); } }}>
                    <Row>
                        <Col md="4" xs="6">
                            <Form.Control
                                type="search"
                                name="checker_name"
                                placeholder="name or username"
                                id="checkedName"
                                className="form-control-lg"
                                autoComplete="off"
                            />{/*onChange={handleChange}*/}
                            <div className="form-text">Type the desirable name to check if there are free usernames or domain names for it</div>
                            <Button type="submit" variant={"primary"} className="form-control-lg">Submit</Button>
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
                                {/*<Col md="3" xs="12">*/}
                                {/*    <b>Shops</b>*/}
                                {/*    {shopsIndexes.map(function (value: number, i: number) {*/}
                                {/*        return <div key={i}>*/}
                                {/*            <label htmlFor={'nametype-' + value.toString()}>*/}
                                {/*                <input*/}
                                {/*                    type="checkbox"*/}
                                {/*                    name={`namespaces[${value}]`} id={'nametype-' + value.toString()}*/}
                                {/*                /> {namespaceNames[value]}</label>*/}
                                {/*        </div>*/}
                                {/*    })}*/}
                                {/*</Col>*/}
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
                                    {[...presetZones, ...addedZones].map((zone) => (
                                        <div key={zone}>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedZones.includes(zone)}
                                                    onChange={(e) => {
                                                        setSelectedZones(prev =>
                                                            e.target.checked
                                                                ? [...prev, zone]
                                                                : prev.filter(z => z !== zone)
                                                        );
                                                    }}
                                                /> .{zone}
                                            </label>
                                        </div>
                                    ))}
                                    <div style={{marginTop: '4px', position: 'relative', display: 'flex', gap: '4px'}}>
                                        <div style={{position: 'relative', flex: 1}}>
                                            <input
                                                type="text"
                                                value={customZone}
                                                onChange={(e) => setCustomZone(e.target.value)}
                                                onFocus={() => setZoneDropdownOpen(true)}
                                                onBlur={() => setTimeout(() => setZoneDropdownOpen(false), 150)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomZone(); } }}
                                                placeholder="other zone"
                                                className="form-control form-control-sm"
                                                autoComplete="off"
                                            />
                                            {zoneDropdownOpen && (
                                                <ul style={{
                                                    position: 'absolute',
                                                    top: '100%',
                                                    left: 0,
                                                    zIndex: 100,
                                                    background: '#fff',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '4px',
                                                    margin: '2px 0 0',
                                                    padding: '2px 0',
                                                    listStyle: 'none',
                                                    width: '100%',
                                                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                                                }}>
                                                    {suggestedZones
                                                        .filter(z => z.includes(customZone.replace(/^\./, '')) || customZone === '')
                                                        .map(z => (
                                                            <li
                                                                key={z}
                                                                onMouseDown={() => {
                                                                    setCustomZone(z.replace(/^\./, ''));
                                                                    setZoneDropdownOpen(false);
                                                                }}
                                                                style={{padding: '4px 10px', cursor: 'pointer'}}
                                                                onMouseEnter={e => (e.currentTarget.style.background = '#f0f0f0')}
                                                                onMouseLeave={e => (e.currentTarget.style.background = '')}
                                                            >{z}</li>
                                                        ))}
                                                </ul>
                                            )}
                                        </div>
                                        {customZone.trim() && (
                                            <button
                                                type="button"
                                                onClick={addCustomZone}
                                                className="btn btn-outline-secondary btn-sm"
                                                style={{padding: '0 8px', lineHeight: 1}}
                                            >+</button>
                                        )}
                                    </div>
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

                {history.length > 0 && (
                    <ul className="list-group list-group-flush">
                        {history.map((entry) => (
                            <li key={entry.name} className="list-group-item">
                                <strong>{entry.name}</strong><br />
                                {entry.results.map((ns, i) => (
                                    <span key={i}><NameBadge
                                        name={ns.namespace_id === 1 && ns.params ? `${entry.name}.${ns.params}` : namespaceNames[ns.namespace_id]}
                                        result={ns.result} /> </span>
                                ))}
                                {entry.validationErrors.map((ve, i) => (
                                    <span key={i} className="text-danger ms-1">
                                        {namespaceNames[ve.namespace]}: {ve.errors}
                                    </span>
                                ))}
                            </li>
                        ))}
                    </ul>
                )}
            </Container>
        </div>
    )
}

export default App
