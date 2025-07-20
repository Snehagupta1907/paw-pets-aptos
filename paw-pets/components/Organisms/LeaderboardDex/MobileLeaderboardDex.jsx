import { AnimatePresence } from "framer-motion";
import styled from "styled-components";
import Typography from "@/components/Atoms/Text";
import { useState, useContext } from "react";
import { userContext } from "@/pages";
import { GameContext } from "@/pages/_app";
import useSound from "use-sound";
import Image from "next/image";

const MobilePopupOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
`

const MobilePopupContainer = styled.div`
    background-color: var(--primary);
    border-radius: 1.5rem;
    border: 3px solid var(--border);
    border-bottom: 8px solid var(--border);
    width: 100%;
    max-width: 350px;
    max-height: 80vh;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    position: relative;
    overflow-y: auto;
`

const MobileHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1rem;
    border-bottom: 2px solid var(--button-light);
`

const MobileCloseButton = styled.button`
    background: var(--border-light);
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
        background: var(--border-hard);
    }
`

const MobileLeaderboardTable = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 400px;
    overflow-y: auto;
`

const MobileTableHeader = styled.div`
    display: grid;
    grid-template-columns: 0.5fr 2fr 1fr 1fr;
    gap: 0.5rem;
    padding: 0.8rem;
    background: rgba(248, 215, 168, 0.4);
    border-radius: 0.8rem;
    border: 2px solid var(--button-light);
    font-weight: 600;
    font-size: 0.9rem;
`

const MobileTableRow = styled.div`
    display: grid;
    grid-template-columns: 0.5fr 2fr 1fr 1fr;
    gap: 0.5rem;
    padding: 0.8rem;
    background: ${props => props.index % 2 === 0 ? 'rgba(248, 215, 168, 0.2)' : 'white'};
    border-radius: 0.8rem;
    border: 2px solid var(--button-light);
    align-items: center;
    font-size: 0.9rem;
`

const MobileUserInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`

const MobileUserAvatar = styled.div`
    width: 30px;
    height: 30px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid var(--button-medium);
`

const MobileProgressBar = styled.div`
    width: 100%;
    height: 8px;
    background: var(--button-light);
    border-radius: 4px;
    overflow: hidden;
`

const MobileProgressFill = styled.div`
    height: 100%;
    background: var(--secondary-accent);
    width: ${props => props.progress}%;
    transition: width 0.3s ease;
`

const MobileRank = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    color: ${props => {
        if (props.rank === 1) return '#FFD700';
        if (props.rank === 2) return '#C0C0C0';
        if (props.rank === 3) return '#CD7F32';
        return 'var(--black)';
    }};
`

export default function MobileLeaderboardDex({
    active,
    onExit = () => { }
}) {
    const { Volume } = useContext(GameContext);
    const [sound] = useSound('/sound/page.mp3', { volume: Volume, });

    // Mock leaderboard data - replace with actual data
    const leaderboardData = [
        {
            rank: 1,
            user: {
                name: "CatLover123",
                avatar: "/user/pfp.svg",
                address: "0x1234..."
            },
            meals: 150,
            catdex: "5/5"
        },
        {
            rank: 2,
            user: {
                name: "MeowMaster",
                avatar: "/user/pfp2.svg",
                address: "0x5678..."
            },
            meals: 120,
            catdex: "4/5"
        },
        {
            rank: 3,
            user: {
                name: "Purrfect",
                avatar: "/user/pfp3.svg",
                address: "0x9abc..."
            },
            meals: 100,
            catdex: "3/5"
        },
        {
            rank: 4,
            user: {
                name: "Whiskers",
                avatar: "/user/pfp4.svg",
                address: "0xdef0..."
            },
            meals: 80,
            catdex: "2/5"
        },
        {
            rank: 5,
            user: {
                name: "User 0x2afe...",
                avatar: "/user/pfp.svg",
                address: "0x2afe..."
            },
            meals: 60,
            catdex: "1/5"
        }
    ];

    return (
        <AnimatePresence>
            {active && (
                <MobilePopupOverlay
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onExit}
                >
                <MobilePopupContainer
                    initial={{ scale: 0.8, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.8, y: 50 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <MobileHeader>
                        <Typography
                            text="Leaderboard"
                            weight="600"
                            size="1.5rem"
                            color="var(--secondary-accent)"
                        />
                        <MobileCloseButton onClick={onExit}>
                            <Image src="/icons/exit.svg" width={20} height={20} alt="Close" />
                        </MobileCloseButton>
                    </MobileHeader>

                    <MobileLeaderboardTable>
                        <MobileTableHeader>
                            <div>#</div>
                            <div>Emperor</div>
                            <div>Meals</div>
                            <div>CatDex</div>
                        </MobileTableHeader>
                        
                        {leaderboardData.map((entry, index) => (
                            <MobileTableRow key={index} index={index}>
                                <MobileRank rank={entry.rank}>
                                    {entry.rank}
                                </MobileRank>
                                
                                <MobileUserInfo>
                                    <MobileUserAvatar>
                                        <Image 
                                            src={entry.user.avatar} 
                                            width={30} 
                                            height={30} 
                                            alt="Avatar"
                                        />
                                    </MobileUserAvatar>
                                    <Typography
                                        text={entry.user.name}
                                        weight="500"
                                        size="0.9rem"
                                        color="var(--black)"
                                    />
                                </MobileUserInfo>
                                
                                <Typography
                                    text={entry.meals}
                                    weight="500"
                                    size="0.9rem"
                                    color="var(--black)"
                                />
                                
                                <div>
                                    <Typography
                                        text={entry.catdex}
                                        weight="500"
                                        size="0.9rem"
                                        color="var(--black)"
                                    />
                                    {entry.rank === 5 && (
                                        <MobileProgressBar>
                                            <MobileProgressFill progress={20} />
                                        </MobileProgressBar>
                                    )}
                                </div>
                            </MobileTableRow>
                        ))}
                    </MobileLeaderboardTable>
                </MobilePopupContainer>
            </MobilePopupOverlay>
            )}
        </AnimatePresence>
    )
} 