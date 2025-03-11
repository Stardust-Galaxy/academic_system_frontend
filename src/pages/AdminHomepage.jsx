import {useAuth} from "../contexts/AuthContext.jsx";
import {useEffect, useState} from "react";

function AdminHomepage() {
    const { user } = useAuth();
    const [info, setInfo] = useState(null);

    useEffect(() => {
        const fetchInfo = async () => {
            const response = await fetch("/api/admin/info", {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            const data = await response.json();
            setInfo(data);
        };
        fetchInfo();
    }, [user.token]);

    if (!info) return <div>Loading...</div>;

    return (
        <Layout role="admin">
            <Card>
                <CardContent>
                    <Typography variant="h4">Welcome, {info.name}</Typography>
                    <Typography>Admin ID: {info.id}</Typography>
                </CardContent>
            </Card>
        </Layout>
    );
}

export default AdminHomepage;