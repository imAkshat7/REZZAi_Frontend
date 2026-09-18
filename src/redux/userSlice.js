import { createSlice } from "@reduxjs/toolkit";

const userSclice=createSlice({
    name:"user",
    initialState:{
        userData:null,
    },
    reducers:{
        setUserdata:(state,action)=>{

            state.userData=action.payload

        },
        clearUserdata:(state)=>{

            state.userData=null

        }
    }
})

export const {setUserdata, clearUserdata} = userSclice.actions
export default userSclice.reducer