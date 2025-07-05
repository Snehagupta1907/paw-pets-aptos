import styled from "styled-components";
import Typography from "@/components/Atoms/Text";
import Image from 'next/image';

const CatCardDiv = styled.div`
background-color:${props => props.bg || "var(--white)"};
padding:1em 1.5em .3em 1.5em;
gap:1em;
display:flex;
flex-direction:column;
justify-content:space-around;
border-radius:1.2em;
width:18em;
cursor:pointer;
transition:all .1s ease-in-out;
border: 3px solid var(--border-hard);
border-bottom: 9px solid var(--border-hard);
&:hover {
   background-color:var(--primary);
}
@media (max-width: 1280px) {
   width:15em;
}
`
const CatTextDiv = styled.div`
display:flex;
flex-direction:column;
gap:.5em;
text-align:left;
`
const CatCardContent = styled.div`
display:flex;
justify-content:space-between;
`
const CatCardHighlight = styled.div`
width: 110%;
height: 10px;
align-self:center;
border-radius: 0px 0px 1em 1em;
background-color: var(--light-accent);
`
export default function CatCard({
   catData,
   onClick = () => { },
   bg
}) {
   console.log(catData)

   if (!catData) return null;
   return (
      <CatCardDiv onClick={onClick} bg={bg}>
         <CatCardContent>
            <CatTextDiv>
               <Typography
                  text={`no. ${catData?.id?.toString().padStart(2, '0')}`}
                  color={"var(--secondary-accent)"}
                  weight={"500"}
               />
               <Typography
                  text={catData.breedName}
                  weight={"500"}
                  size={"1.2rem"}
               />
               {catData.stage?.name && (
                  <Typography
                     text={catData.stage.name}
                     size={"1rem"}
                     color={"#C2A97A"}
                     weight={"400"}
                     style={{ marginTop: '-0.5em' }}
                  />
               )}
            </CatTextDiv>
            <Image src={`${catData.imgThumb}`} width={50} height={50} alt="cat" style={{ borderRadius: 50, }} />
         </CatCardContent>
         <CatCardHighlight />
      </CatCardDiv>
   )
}