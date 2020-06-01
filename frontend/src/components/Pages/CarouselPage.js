import React, { Component } from 'react';

import { withFirebase } from '../Firebase';
import { withRouter } from 'react-router-dom';

import * as ROUTES from "../../constants/routes"

class Carousel extends Component {
    constructor(props) {
        super(props);

        this.state = {
            authUser: null,
            users: [],
            potentialProfiles: [],
            potentialProfilesIndex: 0,
            // queue: [],
            // queueIndex: 0,
            previousProfile: null,
            // viewedProfiles: [],
            currentProfile: null,
            nextProfile: null,
            nextNextProfile: null,
            prevProfile: null,
            prevPrevProfile: null
        }
    }

    componentDidMount() {
        this.listener = this.props.firebase.auth.onAuthStateChanged(
            authUser => {
                if (authUser) {
                    this.setState({ authUser: authUser });
                    this.populateCarousel(authUser.uid)
                } else {
                    this.setState({ authUser: null })
                    // redirect to login screen since no user is signed in
                    this.props.history.push(ROUTES.SIGN_IN)
                }
            }
        )
    }

    componentWillUnmount() {
        this.listener(); // prevents a memory leak or something
    }

    // step 3: Pick 1 profile to be the "previous" position, another to be the "selected" position, a third to be "next"
    // step 4: show one profile pic per user in the carousel. pick the first profile pic in their storage.
    // step 5: display the profile info of the user in the "selected" position. allow the viewer to "Like" or "Pass" on the profile.
    // step 6: if the user clicks "Next", "Like" or "Pass", go to the next profile.
    // step 7: if the user clicks "Like", add the viewer to the user's list of Likes in the database.
    // step 8: if the user clicks "pass", simply go to the next profile. the user who was Passed on remains available in the queue.
    // step 9: if the user clicks "next", simply go to the next profile.

    // TODO: Exclude profiles already Liked by the authUser from listOfPotentialProfiles

    populateCarousel = authUserUID => {
        // Step 1: get a list of potential profiles. do this only one time.
        // retrieve new user profiles to add to the queue for display in the carousel
        const listOfPotentialProfilesUIDs = this.props.firebase.retrieveNewProfileUIDs(authUserUID)

        // add the potential profiles to state
        listOfPotentialProfilesUIDs.then(profileUIDs => {
            // console.log("HEY", resultingProfiles)
            this.setState({ potentialProfiles: profileUIDs })

            // step 2: select 3 from the list of potential profiles... one for Current, one for Next, one for NextNext
            this.loadProfile(profileUIDs[0], 0)
            this.loadProfile(profileUIDs[1], 1)
            this.loadProfile(profileUIDs[2], 2)
        })
    }

    // NOTE: The idea is to keep all of the profiles in the Queue LOADED so the BrowsingUser's experience is pleasant.
    // Do all the loading off-screen.

    loadProfile = (uid, position) => {
        // loads profile "uid" into position "position" in the carousel. Positions are -2, -1, 0, 1, 2.
        const userInfo = this.props.firebase.getUserInfo(uid)
        // retrieve the user's associated profile pics
        const profileURLs = this.props.firebase.getProfileURLsByUID(uid)

        Promise.all([userInfo, profileURLs]).then(infoAndURLs => {
            const infoURLsAndUID = infoAndURLs;
            infoURLsAndUID.push(uid)
            // load userInfo and profile pic URLs into corresponding state
            if (position === -2) {
                console.log("Position -2")
                this.setState({ prevPrevProfile: infoURLsAndUID })
                this.loadPhotos(infoAndURLs[1], position)
            } else if (position === -1) {
                console.log("Position -1")
                this.setState({ prevProfile: infoURLsAndUID })
                this.loadPhotos(infoAndURLs[1], position)
            } else if (position === 0) {
                console.log("Position 0")
                this.setState({ currentProfile: infoURLsAndUID })
                this.loadPhotos(infoAndURLs[1], position)
            } else if (position === 1) {
                console.log("Position 1")
                this.setState({ nextProfile: infoURLsAndUID })
                this.loadPhotos(infoAndURLs[1], position)
            } else if (position === 2) {
                console.log("Position 2")
                this.setState({ nextNextProfile: infoURLsAndUID })
                this.loadPhotos(infoAndURLs[1], position)
            } else {
                throw new Error("You shouldn't be able to get here you know.")
            }
        })
    }

    loadPhotos = (URLs, position) => {
        // if position = 0, load 3. else, load 1
        if (position === 0) {
            this.setState({ currentUserProfileURLs: URLs })
        } else {

        }
    }

    likeUser = () => {
        this.props.firebase.addLike(this.state.currentProfile[2], this.state.authUser.uid)
        this.moveQueueForward()
    }

    getNewProfile = (profileIndex, position) => {
        // retrieves info from potentialProfiles by profileIndex
        const profileToLoad = this.state.potentialProfiles[profileIndex]
        this.loadProfile(profileToLoad, position)
    }

    moveQueueForward = () => {
        // moves queue position 0 -> -1, 1 -> 0, 2 -> 1 etc
        // the first time the user clicks this on the pg, the following things should happen:
        // nextProfile -> currentProfile
        // nextNextProfile -> nextProfile
        // NEW profile => nextNextProfile
        // currentProfile -> prevProfile
        // && if it is the 2nd click: prevProfile -> prevPrevProfile
        // can the queue simply move left and right along the potentialProfiles list?

        // start by using the value of potentialProfilesIndex + 1 as currentIndex because we are moving the queue one position right
        const currentIndex = this.state.potentialProfilesIndex + 1

        // start state
        const nextNextProfile = this.state.nextNextProfile
        const nextProfile = this.state.nextProfile
        const currentProfile = this.state.currentProfile
        const prevProfile = this.state.prevProfile
        // prevPrevProfile is not on the list because it gets "bumped off"

        let newProfile;
        // console.log("CHECKVAL:", currentIndex)
        if (currentIndex >= this.state.potentialProfiles.length - 2) { // what to do for case where there IS no next profile to load.
            console.log("end of the queue!")
            newProfile = null
            this.setState({ nextNextProfile: newProfile })
        } else {
            // currentIndex + 2 because after moving the index one to the right we still have to get the profile 2 further to the right
            // 2 for 2nd arg so getNewProfile can pass down 2 as the position to .loadProfile
            // console.log("WTF:", currentIndex + 2)
            newProfile = this.getNewProfile(currentIndex + 2, 2) // returns the profile info to load into state
        }

        // move viewfinder one to the right
        // this.setState({ nextNextProfile: newProfile }) // state update handled by getNewProfile (follow logic to end of loadProfile)
        this.setState({ nextProfile: nextNextProfile })
        this.setState({ currentProfile: nextProfile })
        this.setState({ prevProfile: currentProfile })
        this.setState({ prevPrevProfile: prevProfile })

        // update the potentialProfilesIndex for next time
        this.setState({ potentialProfilesIndex: currentIndex })
    }

    moveQueueBackward = () => {
        // moveQueueForward but in reverse
        if (this.state.potentialProfilesIndex > 0) { // if there is a profile prior to the currentProfile in the queue...
            // start by using the value of potentialProfilesIndex - 1 as currentIndex b/c we are moving the queue one position left
            const currentIndex = this.state.potentialProfilesIndex - 1

            // start state
            const nextProfile = this.state.nextProfile
            const currentProfile = this.state.currentProfile
            const prevProfile = this.state.prevProfile
            const prevPrevProfile = this.state.prevPrevProfile
            // nextNextProfile is not on the list because it gets "bumped off"

            let newProfile;
            // if at index 0 to 2, there is no profile to load; prevProfile and prevPrevProfile are still in memory
            if (currentIndex <= 2) {
                console.log("beginning of queue!")
                newProfile = null
                this.setState({ prevPrevProfile: newProfile })
            } else {
                // currentIndex-2 b/c after moving index one to the left we still must get the profile 2 further to the left
                // -2 for 2nd arg so getNewProfile can pass down -2 as the position to .loadProfile
                newProfile = this.getNewProfile(currentIndex - 2, -2) // returns the profile info to load into state
            }

            // move viewfinder one to the left
            this.setState({ nextNextProfile: nextProfile })
            this.setState({ nextProfile: currentProfile })
            this.setState({ currentProfile: prevProfile })
            this.setState({ prevProfile: prevPrevProfile })
            // this.setState({ prevPrevProfile: newProfile }) // state update handled by getNewProfile (follow logic to end of loadProfile)

            // update the potentialProfilesIndex for next time
            this.setState({ potentialProfilesIndex: currentIndex })
        } else {
            // tell the user they can't go back because there is no user to go back to
        }
    }

    testState = () => {
        console.log(this.state)
    }

    render() {
        return (
            <div>
                <h1>Browse Users</h1>

                <h3>Previous User</h3>
                {this.state.prevProfile !== null ?
                    <div>
                        <h4>{this.state.prevProfile[0].username}</h4>
                        <img src={this.state.prevProfile[1][0]} alt="Profile Pic" width="150" height="200" />
                    </div> :
                    <p>No Previous User</p>
                }

                <div>
                    {this.state.nextProfile === null ? "No more users in the system! To help the site grow, tell some friends about the site!" :
                        this.state.currentProfile ? <Profile values={this.state} /> : "Loading..."}
                    {}
                </div>
                <div>
                    <button onClick={this.moveQueueForward}>Pass</button>
                    <button onClick={this.likeUser}>Like</button>
                </div>

                {this.state.prevProfile === null ? <div>
                    <button onClick={this.moveQueueForward}>Next</button>
                </div> :
                    <div>
                        <button onClick={this.moveQueueBackward}>Previous</button>
                        <button onClick={this.moveQueueForward}>Next</button>
                    </div>
                }

                <h3>Next User</h3>
                {this.state.nextProfile !== null ?
                    <div>
                        <h4>{this.state.nextProfile[0].username}</h4>
                        <img src={this.state.nextProfile[1][0]} alt="Profile Pic" width="150" height="200" />
                    </div> :
                    <p>No Next User</p>
                }

                <button onClick={this.testState}>Test State</button>
            </div>
        )
    }
}

// FIXME: profile images should show up. 

class Profile extends Component {
    render() {
        return (
            <div>
                <h3>Current User</h3>

                <h3>Username:</h3><p>{this.props.values.currentProfile[0].username}</p>

                <h3>Current User Profile Pics:</h3>
                <div>
                    {this.props.values.currentProfile[1].length > 0 ?
                        this.props.values.currentProfile[1].map((url, index) => {
                            return <div key={index}>
                                <img src={url} alt={`Profile Pic ${index}`} width="150" height="200" />
                            </div>
                        }) : "User has no profile pics!"}
                </div>

                <h3>Location:</h3>
                <p>{this.props.values.currentProfile[0].city},
                    {this.props.values.currentProfile[0].state},
                    {this.props.values.currentProfile[0].country}</p>

                <h3>Age:</h3><p>{this.props.values.currentProfile[0].age}</p>

                {this.props.values.currentProfile[0].kids === "1" ?
                    <h3>Intends to have {this.props.values.currentProfile[0].kids} kid.</h3> :
                    <h3>Intends to have {this.props.values.currentProfile[0].kids} kids.</h3>
                }

                <h3>Family Values:</h3><p>{this.props.values.currentProfile[0].familyValues}</p>

                <h3>Interests:</h3><p>{this.props.values.currentProfile[0].interests}</p>

                <h3>Has pets:</h3><p>{this.props.values.currentProfile[0].hasPets ? "yes" : "no"}</p>

                <h3>Diet:</h3><p>{this.props.values.currentProfile[0].diet}</p>

                <h3>Drinks:</h3><p>{this.props.values.currentProfile[0].drinks}</p>

                <h3>Smokes:</h3><p>{this.props.values.currentProfile[0].smokes}</p>

                <h3>Does drugs:</h3><p>{this.props.values.currentProfile[0].doesDrugs}</p>
            </div>
        )
    }
}

export default withRouter(withFirebase(Carousel));