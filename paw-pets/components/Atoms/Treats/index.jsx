import styled from "styled-components";
import Image from "next/image";

const TreatArea = styled.div`
position:absolute;
pointer-events:none;
`

const TreatImage = styled(Image)`
pointer-events:none;
transform:translate(10vw, 8vh);

@media screen and (max-width: 768px) {
  max-width: 60px;
  max-height: 60px;
}
`
export default function Treats({
    image,
    alt
}) {

    return (
        <>
            <TreatArea>
                <TreatImage src={image} height={150} width={150} alt={alt} />
            </TreatArea >
        </>
    )
}