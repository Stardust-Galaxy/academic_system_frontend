import {useEffect, useState} from "react";
import {useAuth} from "../contexts/AuthContext.jsx";

function TeacherHomepage() {
    const { user } = useAuth();
    const [info, setInfo] = useState(null);

    useEffect(() => {
        const fetchInfo = async () => {
            const response = await fetch("/api/teacher/info", {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            const data = await response.json();
            setInfo(data);
        };
        fetchInfo();
    }, [user.token]);

    if (!info) return <div>Loading...</div>;

    return (
        <Layout role="teacher">
            <Card>
                <CardContent>
                    <Typography variant="h4">Welcome, {info.name}</Typography>
                    <Typography>Teacher ID: {info.id}</Typography>
                    <Typography>Department: {info.department}</Typography>
                </CardContent>
            </Card>
        </Layout>
    );
}
export default TeacherHomepage;