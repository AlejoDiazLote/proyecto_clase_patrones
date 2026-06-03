import './polyfills.server.mjs';
import{a as n}from"./chunk-RQCV77LW.mjs";import{kb as o,m as r}from"./chunk-FHXEMTOC.mjs";function f(u){return()=>{let e=r(n),t=r(o);if(!e.isLoggedIn())return t.createUrlTree(["/auth/login"]);let i=e.currentUser?.rol??"";return u.includes(i)?!0:t.createUrlTree(["/events"])}}export{f as a};
