import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConnectService {

  apiOrgUrl = 'http://127.0.0.1:5000/';

  constructor(private http: HttpClient) { }
  isLoggedIn(){
    return sessionStorage.getItem('token')!==null;
  }

  getuserRoleSession()
  {
    return sessionStorage.getItem('userRole')!= null?sessionStorage.getItem('userRole')?.toString():'';
  }

  // Helper function to retrieve token from session storage
  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  // Helper function to create headers with JWT token
  getHeaders(): HttpHeaders {
    const token = this.getToken();
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    } else {
      // Handle case where token is not available
      return new HttpHeaders();
    }
  }

  // Organization Services
  getAllOrg() {
    return this.http.get<any>(this.apiOrgUrl + 'orgs/list', { headers: this.getHeaders() });
  }

  getOrgByid(code:any){
    return this.http.post<any>(this.apiOrgUrl+'org/byid/',code, {headers: this.getHeaders() });

  }

  addOrg(code: any) {
    return this.http.post<any>(this.apiOrgUrl + 'orgs/register', code, { headers: this.getHeaders() });
  }

  delOrg(code: any) {
    return this.http.delete<any>(this.apiOrgUrl + 'orgs/delete/' + code, { headers: this.getHeaders() });
  }

  updateOrg(code: any, inputData: any) {
    return this.http.put<any>(this.apiOrgUrl + '/orgs/edit/' + code, inputData, { headers: this.getHeaders() });
  }

  // User functions
  addUser(code: any) {
    return this.http.post<any>(this.apiOrgUrl + 'users/register', code, { headers: this.getHeaders() });
  }

  getAllUser() {
    return this.http.get<any>(this.apiOrgUrl + '/users/list', { headers: this.getHeaders() });
  }

  getUserbyUserId(code:any){
    return this.http.post<any>(this.apiOrgUrl+'users/byid/',code, {headers: this.getHeaders() });
  }

  updateUser(code: any, inputData: any) {
    return this.http.put<any>(this.apiOrgUrl + 'users/edit/' + code, inputData, { headers: this.getHeaders() });
  }

  deleteUser(code: any) {
    return this.http.delete(this.apiOrgUrl + "users/delete/" + code, { headers: this.getHeaders() });
  }
  
  getUserByOrgId(code:any){
    return this.http.post<any>(this.apiOrgUrl+'users/orgs/',code, {headers: this.getHeaders() });
  }

  // Fetch user role
  getUserRole() {
    return this.http.get<any>(this.apiOrgUrl + 'roles/list', { headers: this.getHeaders() });
  }

  // Accounts Services
  getAllAccs() {
    return this.http.get<any>(this.apiOrgUrl + 'accs', { headers: this.getHeaders() });
  }

  setCreds(data: any) {
    return this.http.post<any>(this.apiOrgUrl + "set_credentials", data, { headers: this.getHeaders() });
  }

  addAccount(code: any) {
    return this.http.post<any>(this.apiOrgUrl + 'accs/register', code, { headers: this.getHeaders() });
  }

  deleteAccount(data:any){
    return this.http.delete(this.apiOrgUrl + "accs/" + data, { headers: this.getHeaders() })
  }
  // OTP
  getOtp(data: any) {
    return this.http.post<any>(this.apiOrgUrl + "getOTP", data, { headers: this.getHeaders() });
  }

  // User login
  getUserLogin(data: any) {
    return this.http.post<any>(this.apiOrgUrl + "login", data);
  }

  userLogout(){
    return 
  }


  //copy-tread
  getaccountInfo(){
    return this.http.get<any>(this.apiOrgUrl +'accs',{ headers: this.getHeaders() });
  }
  
  accountInfoByOrgid(code:any){
    return this.http.post<any>(this.apiOrgUrl+'accs/org',code,{headers:this.getHeaders()});
  }

  // updateAccountInfo(accountId: string, inputData: any): Observable<any> {
  //   const url = `${this.apiOrgUrl}/accs/update/`;
  //   return this.http.put<any>(url, inputData,{headers:this.getHeaders()});
  // }
  updateAccountInfo(code:any){
    return this.http.put<any>(this.apiOrgUrl+'accs/update/',code,{headers:this.getHeaders()})
  }

  updateSingleAccountinfo(code:any){
    return this.http.put<any>(this.apiOrgUrl+'accs/update-details/',code,{headers:this.getHeaders()})  
  }

}
