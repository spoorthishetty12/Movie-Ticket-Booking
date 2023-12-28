import React, { useEffect } from "react"
import { GetCurrentUser } from "../apicalls/users"
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { SetUser } from "../redux/usersSlice";
import { HideLoading, ShowLoading } from "../redux/loadersSlice";

function ProtectedRoute({ children }) {
    const { user } = useSelector((state) => state.users)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const getCurrentUser = async () => {
        try {
            dispatch(ShowLoading())
            const response = await GetCurrentUser();
            dispatch(HideLoading())
            if (response.success) {
                dispatch(SetUser(response.data))
            } else {
                dispatch(SetUser(null))
                message.error(response.message)
                localStorage.removeItem("token")
                navigate("/login")
            }
        } catch (error) {
            dispatch(HideLoading())
            dispatch(SetUser(null))
            message.error(error.message)
        }
    }

    useEffect(() => {
        if (localStorage.getItem("token")) {
            getCurrentUser()
        } else {
            navigate("/login")
        }
    }, [])

    return (
        user && (
            <div className="layout p-1">
                <div className="header bg-primary flex justify-between p-2">
                    <div>
                        <h1 className="text-2xl text-white cursor-pointer"
                            onClick={() => navigate("/")}>
                            <i className="ri-movie-2-line p-1"></i>
                            CINEMAS
                        </h1>
                    </div>
                    <div className="bg-white p-1 flex gap-1">
                        <div className="flex gap-1">
                        <i class="ri-home-office-fill"></i>
                            <h1 className="text-sm underline" onClick={() => navigate("/")}>Home</h1>
                        </div>
                        <i className="ri-user-fill ml-1"></i>
                        <h1 className="text-sm underline"
                            onClick={() => {
                                if (user.roles === "admin") {
                                    navigate('/admin')
                                } else if (user.roles === "theater") {
                                    navigate('/theater')
                                } else {
                                    navigate('/profile')
                                }
                            }}>
                            {user.name}
                        </h1>
                        <i className="ri-logout-circle-r-line ml-1"></i>
                        <h1 className="text-sm underline"
                            onClick={() => {
                                localStorage.removeItem("token");
                                navigate("/login")
                            }}
                        >Logout</h1>
                    </div>

                </div>
                <div className="content mt-1 p-1">

                    {children}
                </div>
            </div>


        )
    )
}

export default ProtectedRoute