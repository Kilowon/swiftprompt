import { Accessor } from "solid-js"

interface GroupContainerSearchProps {
	setIsFullElements: (value: boolean) => void
	isFullElements: Accessor<boolean>
}

function GroupContainerSearch(props: GroupContainerSearchProps) {
	return <div>GroupContainerSearch</div>
}

export default GroupContainerSearch
