import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    AppBar,
    Box,
    CssBaseline,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    Divider,
    Button,
    Container
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import BookIcon from "@mui/icons-material/Book";
import GradeIcon from "@mui/icons-material/Grade";
import SchoolIcon from "@mui/icons-material/School";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";

const drawerWidth = 240;

function Layout({ children, role }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const navigationItems = {
        student: [
            { text: "Home", icon: <HomeIcon />, path: "/student" },
            { text: "My Schedule", icon: <CalendarMonthIcon />, path: "/student/schedule" },
            { text: "Course Selection", icon: <BookIcon />, path: "/student/course-selection" },
            { text: "My Grades", icon: <GradeIcon />, path: "/student/grades" }
        ],
        teacher: [
            { text: "Home", icon: <HomeIcon />, path: "/teacher" },
            { text: "Course Management", icon: <BookIcon />, path: "/teacher/course-management" },
            { text: "Grades Management", icon: <GradeIcon />, path: "/teacher/grades-management" }
        ],
        admin: [
            { text: "Dashboard", icon: <HomeIcon />, path: "/admin" },
            { text: "Admin Control", icon: <SettingsIcon />, path: "/admin/control" }
        ]
    };

    const drawer = (
        <div>
            <Toolbar>
                <Typography variant="h6" noWrap component="div">
                    Academic System
                </Typography>
            </Toolbar>
            <Divider />
            <List>
                {navigationItems[role]?.map((item) => (
                    <ListItem
                        button
                        component={Link}
                        to={item.path}
                        key={item.text}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
            </List>
            <Divider />
            <List>
                <ListItem button onClick={handleLogout}>
                    <ListItemIcon><LogoutIcon /></ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItem>
            </List>
        </div>
    );

    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: "none" } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                        <SchoolIcon sx={{ mr: 1 }} />
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            {role.charAt(0).toUpperCase() + role.slice(1)} Portal
                        </Typography>
                        <Button color="inherit" onClick={handleLogout}>
                            Logout
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    sx={{
                        display: { xs: "block", sm: "none" },
                        "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: "none", sm: "block" },
                        "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    mt: 8
                }}
            >
                <Container maxWidth="xl">
                    {children}
                </Container>
            </Box>
        </Box>
    );
}

export default Layout;