/**
 * @jest-environment jsdom
 */

import { localStorageMock } from "../__mocks__/localStorage";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import {screen} from "@testing-library/dom"
import Bills from "../containers/Bills.js";
import "@testing-library/jest-dom"

// Test d'intégration GET

jest.mock('../app/Store.js', () => mockStore)

describe("Given I am connected as an employee", () => {
    describe("When I navigate to Bills page", () => {
        test("Then bills are fetched from mock API GET", async() => {
            Object.defineProperty(window, 'localStorage', { value: localStorageMock })
            window.localStorage.setItem("user", JSON.stringify({
                type: "Employee",
                email: "a@a"
            }))

            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname })
            }

            const billsInstance = new Bills({
                document, onNavigate, store: mockStore, localStorage: window.localStorage
            })

            const data = await billsInstance.getBills()
            const mockedData = await mockStore.bills().list()

            expect(data.length).toBe(mockedData.length)
        })
        describe("When an error occurs on API", () => {
            beforeEach(() => {
                jest.spyOn(mockStore, "bills")
                Object.defineProperty(window, 'localStorage', { value: localStorageMock })
                window.localStorage.setItem("user", JSON.stringify({
                    type: "Employee",
                    email: "a@a"
                }))
                const root = document.createElement("div")
                root.setAttribute("id", "root")
                document.body.appendChild(root)
                router()
            })
            afterAll(() => {
                jest.clearAllMocks
            })

            test("fetches bills fails with error 404", async () => {
                mockStore.bills.mockImplementationOnce(() => {
                    return {
                        list : () => {
                            return Promise.reject(new Error("Erreur 404"))
                        }
                    }
                })
                window.onNavigate(ROUTES_PATH['Bills'])
                await new Promise(process.nextTick)
                const message = await screen.getByText(/Erreur 404/)
                expect(message).toBeTruthy()
            })
            test("fetches bills fails with error 500", async () => {
                mockStore.bills.mockImplementationOnce(() => {
                    return {
                        list : () => {
                            return Promise.reject(new Error("Erreur 500"))
                        }
                    }
                })
                window.onNavigate(ROUTES_PATH['Bills'])
                await new Promise(process.nextTick)
                const message = await screen.getByText(/Erreur 500/)
                expect(message).toBeTruthy()
            })
        })
    })
})
